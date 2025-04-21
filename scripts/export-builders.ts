import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Constants from the existing codebase
const PARTNER_SCHEMA_UID =
  "0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3";
const BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";
const TALENT_PROTOCOL_ATTESTER = "0x574D993813e5bAB85c7B7761B35C207Ad426D9cC";

// Initialize schema encoders (reused from src/services/eas.ts)
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

  // Create exports directory if it doesn't exist
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const exportsDir = path.join(__dirname, "exports");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Write verified builders to CSV
  const csvContent = Array.from(verifiedBuilders).join("\n");
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

  console.log(`\nOutput written to: ${outputPath}`);
}

main().catch(console.error);
