import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Constants from the existing codebase
const PARTNER_SCHEMA_UID =
  "0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3";
const BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";
const TALENT_PROTOCOL_ATTESTER = "0x574D993813e5bAB85c7B7761B35C207Ad426D9cC";

// Talent Protocol API constants
const TALENT_API_URL = "https://api.talentprotocol.com";
const BATCH_SIZE = 100;
const BATCH_DELAY = 2000; // Increased to 2 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Validate API key
const TALENT_API_KEY = process.env.TALENT_API_KEY;
if (!TALENT_API_KEY) {
  console.error(
    "❌ TALENT_API_KEY is required. Please add it to your .env file."
  );
  process.exit(1);
}

// Initialize schema encoders
const partnerSchemaEncoder = new SchemaEncoder("string name,string url");
const builderSchemaEncoder = new SchemaEncoder("bool isBuilder,string context");

interface Analytics {
  // Partners
  totalValidPartners: number;
  totalInvalidPartners: number;
  activePartners: number;

  // Builders
  totalBuilderAttestations: number;
  uniqueBuilderRecipients: number;
  invalidRefAttestations: number;
  nonBuilderAttestations: number;
  invalidAttesterAttestations: number;
  invalidBuilderAttesters: Map<string, number>;

  // Talent Protocol
  resolvedProfiles: number;
  unresolvedProfiles: number;
  nonExistentProfiles: number;
  addressesWithScore: number;
  repeatedDisplayNames: number;
}

interface TalentProfile {
  name: string | null;
  display_name: string | null;
  image_url: string | null;
  builder_score: number | null;
}

// Talent Protocol API functions
async function getTalentProfile(
  address: string,
  retryCount = 0
): Promise<TalentProfile | null> {
  try {
    // Fetch profile data
    const profileResponse = await fetch(
      `${TALENT_API_URL}/profile?source=wallet&id=${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": TALENT_API_KEY as string,
        },
      }
    );

    if (!profileResponse.ok) {
      if (profileResponse.status === 404) {
        return null;
      }

      // Handle authentication errors
      if (profileResponse.status === 401) {
        console.error(
          "❌ Authentication failed. Please check your TALENT_API_KEY."
        );
        process.exit(1);
      }

      // Handle rate limiting
      if (profileResponse.status === 429 && retryCount < MAX_RETRIES) {
        console.log(
          `Rate limited, retrying in ${
            RETRY_DELAY / 1000
          } seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return getTalentProfile(address, retryCount + 1);
      }

      throw new Error(`HTTP error! status: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    // Fetch builder score
    const scoreResponse = await fetch(
      `${TALENT_API_URL}/score?source=wallet&id=${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": TALENT_API_KEY as string,
        },
      }
    );

    let builderScore = null;
    if (scoreResponse.ok) {
      const scoreData = await scoreResponse.json();
      builderScore = scoreData.score?.points || null;
    }

    return {
      name: profileData.profile?.name || null,
      display_name: profileData.profile?.display_name || null,
      image_url: profileData.profile?.image_url || null,
      builder_score: builderScore,
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Error fetching data for ${address}, retrying in ${
          RETRY_DELAY / 1000
        } seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return getTalentProfile(address, retryCount + 1);
    }

    console.warn(`Error fetching Talent Protocol data for ${address}:`, error);
    return null;
  }
}

async function getTalentDataBatch(
  addresses: string[]
): Promise<Map<string, { profile: TalentProfile | null }>> {
  const result = new Map<string, { profile: TalentProfile | null }>();

  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
        addresses.length / BATCH_SIZE
      )}...`
    );

    // Process profiles in parallel for the batch
    const profiles = await Promise.all(
      batch.map((address) => getTalentProfile(address))
    );

    // Map results back to addresses
    batch.forEach((address, index) => {
      result.set(address, {
        profile: profiles[index],
      });
    });

    // Add delay between batches
    if (i + BATCH_SIZE < addresses.length) {
      console.log(`Waiting ${BATCH_DELAY / 1000} seconds before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
    }
  }

  return result;
}

async function fetchFromEAS(query: string) {
  const response = await fetch("https://base.easscan.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

async function getAllAttestations() {
  const PAGE_SIZE = 1000;
  let allPartners: any[] = [];
  let allBuilders: any[] = [];
  let skip = 0;
  let hasMore = true;

  // Fetch all partner attestations
  while (hasMore) {
    console.log(`Fetching partners page (skip: ${skip})...`);
    const response = await fetchFromEAS(`
            query GetAllAttestations {
                partners: attestations(
                    where: {
                        schemaId: { equals: "${PARTNER_SCHEMA_UID}" }
                        revoked: { equals: false }
                    }
                    take: ${PAGE_SIZE}
                    skip: ${skip}
                ) {
                    id
                    attester
                    recipient
                    refUID
                    revocationTime
                    expirationTime
                    time
                    txid
                    data
                }
            }
        `);

    if (!response?.partners) break;

    allPartners = [...allPartners, ...response.partners];
    hasMore = response.partners.length === PAGE_SIZE;
    skip += PAGE_SIZE;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Reset for builder attestations
  skip = 0;
  hasMore = true;

  // Fetch all builder attestations
  while (hasMore) {
    console.log(`Fetching builders page (skip: ${skip})...`);
    const response = await fetchFromEAS(`
            query GetAllAttestations {
                builders: attestations(
                    where: {
                        schemaId: { equals: "${BUILDER_SCHEMA_UID}" }
                        revoked: { equals: false }
                    }
                    take: ${PAGE_SIZE}
                    skip: ${skip}
                ) {
                    id
                    attester
                    recipient
                    refUID
                    revocationTime
                    expirationTime
                    time
                    txid
                    data
                }
            }
        `);

    if (!response?.builders) break;

    allBuilders = [...allBuilders, ...response.builders];
    hasMore = response.builders.length === PAGE_SIZE;
    skip += PAGE_SIZE;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { partners: allPartners, builders: allBuilders };
}

async function main() {
  console.log("Fetching attestations from EAS...");
  const { partners, builders } = await getAllAttestations();

  // Analytics object
  const analytics: Analytics = {
    // Partners
    totalValidPartners: 0,
    totalInvalidPartners: 0,
    activePartners: 0,

    // Builders
    totalBuilderAttestations: builders.length,
    uniqueBuilderRecipients: 0,
    invalidRefAttestations: 0,
    nonBuilderAttestations: 0,
    invalidAttesterAttestations: 0,
    invalidBuilderAttesters: new Map<string, number>(),

    // Talent Protocol
    resolvedProfiles: 0,
    unresolvedProfiles: 0,
    nonExistentProfiles: 0,
    addressesWithScore: 0,
    repeatedDisplayNames: 0,
  };

  // Process partners
  const validPartnerMap = new Map<string, string>();
  const activePartnerSet = new Set<string>();

  partners.forEach((partner: any) => {
    try {
      if (partner.attester === TALENT_PROTOCOL_ATTESTER) {
        const decodedData = partnerSchemaEncoder.decodeData(partner.data);
        const name = decodedData.find((d: any) => d.name === "name")?.value
          .value as string;
        if (name) {
          validPartnerMap.set(partner.id, name);
          analytics.totalValidPartners++;
        }
      } else {
        analytics.totalInvalidPartners++;
      }
    } catch (error) {
      console.error("Error processing partner:", error);
    }
  });

  // Process builder attestations and collect unique verified builders
  const verifiedBuilders = new Set<string>();
  const uniqueRecipients = new Set<string>();

  builders.forEach((attestation: any) => {
    try {
      uniqueRecipients.add(attestation.recipient);

      // Track invalid attester attestations
      if (!validPartnerMap.has(attestation.refUID)) {
        analytics.invalidRefAttestations++;
        // Track the attester address
        const count =
          analytics.invalidBuilderAttesters.get(attestation.attester) || 0;
        analytics.invalidBuilderAttesters.set(attestation.attester, count + 1);
        return;
      }

      const decodedData = builderSchemaEncoder.decodeData(attestation.data);
      const isBuilder = decodedData.find((d: any) => d.name === "isBuilder")
        ?.value.value;

      if (!isBuilder) {
        analytics.nonBuilderAttestations++;
        return;
      }

      if (attestation.refUID) {
        activePartnerSet.add(attestation.refUID);
        verifiedBuilders.add(attestation.recipient);
      } else {
        analytics.invalidAttesterAttestations++;
      }
    } catch (error) {
      console.error("Error processing builder attestation:", error);
    }
  });

  analytics.activePartners = activePartnerSet.size;
  analytics.uniqueBuilderRecipients = uniqueRecipients.size;

  // Fetch Talent Protocol profiles for all unique addresses
  console.log("\nFetching Talent Protocol profiles...");
  const talentData = await getTalentDataBatch(Array.from(verifiedBuilders));

  // Track display names and their associated addresses
  const displayNameMap = new Map<string, string[]>();

  // Process profile data and prepare CSV content
  const csvRows: string[] = [];
  talentData.forEach((data, address) => {
    const profile = data.profile;
    if (profile?.display_name) {
      analytics.resolvedProfiles++;
      if (profile.builder_score !== null) {
        analytics.addressesWithScore++;
      }

      // Track display names
      const displayName = profile.display_name;
      const addresses = displayNameMap.get(displayName) || [];
      addresses.push(address);
      displayNameMap.set(displayName, addresses);

      csvRows.push(
        `${address},${profile.display_name},${profile.builder_score || ""}`
      );
    } else if (profile === null) {
      analytics.nonExistentProfiles++;
      csvRows.push(`${address},,`);
    } else {
      analytics.unresolvedProfiles++;
      csvRows.push(`${address},,`);
    }
  });

  // Count repeated display names
  displayNameMap.forEach((addresses, displayName) => {
    if (addresses.length > 1) {
      analytics.repeatedDisplayNames++;
    }
  });

  // Create exports directory if it doesn't exist
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const exportsDir = path.join(__dirname, "exports");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Write verified builders to CSV
  const csvContent =
    "address,display_name,builder_score\n" + csvRows.join("\n");
  const outputPath = path.join(exportsDir, "verified-builders.csv");
  fs.writeFileSync(outputPath, csvContent);

  // Print analytics
  console.log("\n=== PARTNERS ===");
  console.log(`Valid Partner Attestations: ${analytics.totalValidPartners}`);
  console.log(
    `Invalid Partner Attestations: ${analytics.totalInvalidPartners}`
  );
  console.log(
    `Active Partners (issued 1+ attestations): ${analytics.activePartners}`
  );

  console.log("\n=== BUILDERS ===");
  console.log(
    `Builder Attestations (total issued): ${analytics.totalBuilderAttestations}`
  );
  console.log(
    `Builder Attestations (total unique recipients): ${analytics.uniqueBuilderRecipients}`
  );
  console.log(
    `Builder Attestations (valid unique recipients): ${verifiedBuilders.size}`
  );
  console.log(
    `Invalid Builder attestations (valid address, but no valid partner reference): ${analytics.invalidRefAttestations}`
  );
  console.log(
    `Invalid Builder attestations (IsBuilder = false): ${analytics.nonBuilderAttestations}`
  );
  console.log(
    `Invalid Builder attestations (issued by invalid partner addresses): ${analytics.invalidAttesterAttestations}`
  );

  // Print invalid attester details
  if (analytics.invalidBuilderAttesters.size > 0) {
    console.log("\nInvalid Builder Attestation Attesters:");
    analytics.invalidBuilderAttesters.forEach((count, attester) => {
      console.log(`- ${attester}: ${count} attestations`);
    });
  }

  console.log("\n=== TALENT PROTOCOL ===");
  console.log(
    `Addresses with resolved display names: ${analytics.resolvedProfiles}`
  );
  console.log(
    `Addresses with no display name: ${analytics.unresolvedProfiles}`
  );
  console.log(`Addresses with no profile: ${analytics.nonExistentProfiles}`);
  console.log(`Addresses with Builder Score: ${analytics.addressesWithScore}`);
  console.log(
    `Display names used by multiple addresses: ${analytics.repeatedDisplayNames}`
  );

  console.log(`\nOutput written to: ${outputPath}`);
}

main().catch(console.error);
