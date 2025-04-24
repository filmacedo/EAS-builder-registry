import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {
  VerificationPartnerAttestation,
  VerifiedBuilderAttestation,
  Network,
} from "@/types";

// Base Network Schema UIDs
const BASE_PARTNER_SCHEMA_UID =
  "0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3";
const BASE_BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";

// Celo Network Schema UIDs
const CELO_PARTNER_SCHEMA_UID =
  "0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3";
const CELO_BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";

// Initialize schema encoders
const partnerSchemaEncoder = new SchemaEncoder("string name,string url");
const builderSchemaEncoder = new SchemaEncoder("bool isBuilder,string context");

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fetchFn, retries - 1);
    }
    throw error;
  }
}

async function fetchFromEAS(query: string, network: Network) {
  const response = await fetch("/api/eas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, network }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`HTTP error from ${network} network:`, {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log(`Response from ${network} network:`, result);

  if (!result || !result.data) {
    console.error(
      `Invalid response structure from ${network} network:`,
      result
    );
    throw new Error(
      `Invalid response structure from EAS API on ${network}: missing result or data field`
    );
  }

  return result.data;
}

export async function getAllAttestations() {
  return fetchWithRetry(async () => {
    try {
      const PAGE_SIZE = 1000;
      let allPartners: any[] = [];
      let allBuilders: any[] = [];
      let skip = 0;
      let hasMore = true;
      let pageCount = 0;

      // Fetch all partner attestations from both networks
      for (const network of ["base", "celo"] as Network[]) {
        skip = 0;
        hasMore = true;
        pageCount = 0;

        const schemaUID =
          network === "base"
            ? BASE_PARTNER_SCHEMA_UID
            : CELO_PARTNER_SCHEMA_UID;

        while (hasMore) {
          pageCount++;
          const response = await fetchFromEAS(
            `
            query GetAllAttestations {
              partners: attestations(
                where: {
                  schemaId: { equals: "${schemaUID}" }
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
          `,
            network
          );

          if (!response || !response.partners) {
            throw new Error(
              `Invalid response structure from EAS API for partners on ${network}`
            );
          }

          // Add network information to each attestation
          const networkAttestations = response.partners.map(
            (attestation: any) => ({
              ...attestation,
              network,
            })
          );

          allPartners = [...allPartners, ...networkAttestations];
          hasMore = response.partners.length === PAGE_SIZE;
          skip += PAGE_SIZE;

          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      // Reset for builder attestations
      skip = 0;
      hasMore = true;
      pageCount = 0;

      // Fetch all builder attestations from both networks
      for (const network of ["base", "celo"] as Network[]) {
        skip = 0;
        hasMore = true;
        pageCount = 0;

        const schemaUID =
          network === "base"
            ? BASE_BUILDER_SCHEMA_UID
            : CELO_BUILDER_SCHEMA_UID;

        while (hasMore) {
          pageCount++;
          const response = await fetchFromEAS(
            `
            query GetAllAttestations {
              builders: attestations(
                where: {
                  schemaId: { equals: "${schemaUID}" }
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
          `,
            network
          );

          if (!response || !response.builders) {
            throw new Error(
              `Invalid response structure from EAS API for builders on ${network}`
            );
          }

          // Add network information to each attestation
          const networkAttestations = response.builders.map(
            (attestation: any) => ({
              ...attestation,
              network,
            })
          );

          allBuilders = [...allBuilders, ...networkAttestations];
          hasMore = response.builders.length === PAGE_SIZE;
          skip += PAGE_SIZE;

          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      return {
        partners: allPartners,
        builders: allBuilders,
      };
    } catch (error) {
      console.error("Error in getAllAttestations:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  });
}

export async function getVerificationPartners(): Promise<
  VerificationPartnerAttestation[]
> {
  const data = await getAllAttestations();
  const attestations = data.partners;

  // First decode the attestations
  const decodedAttestations = attestations.map((attestation: any) => {
    try {
      if (!attestation.data || attestation.data === "0x") {
        return {
          ...attestation,
          decodedData: null,
        };
      }

      const decodedData = partnerSchemaEncoder.decodeData(attestation.data);
      const name = decodedData.find((d) => d.name === "name")?.value
        .value as string;
      const url = decodedData.find((d) => d.name === "url")?.value
        .value as string;

      return {
        ...attestation,
        decodedData: {
          name,
          url,
        },
      };
    } catch (error) {
      console.error("Error decoding partner data:", error);
      return {
        ...attestation,
        decodedData: null,
      };
    }
  });

  // Return the decoded attestations without ENS resolution
  return decodedAttestations;
}

export async function getVerifiedBuilders(): Promise<
  VerifiedBuilderAttestation[]
> {
  const data = await getAllAttestations();
  const builderAttestations = data.builders;
  const partnerAttestations = data.partners;

  // Create a map of valid partner attestation UIDs (only those issued by attestations.talentprotocol.eth)
  const validPartnerMap = new Map<string, string>();
  const TALENT_PROTOCOL_ATTESTER = "0x574D993813e5bAB85c7B7761B35C207Ad426D9cC"; // attestations.talentprotocol.eth

  partnerAttestations.forEach((partner: any) => {
    try {
      if (
        !partner.data ||
        partner.data === "0x" ||
        partner.attester !== TALENT_PROTOCOL_ATTESTER
      ) {
        return;
      }

      const decodedData = partnerSchemaEncoder.decodeData(partner.data);
      const name = decodedData.find((d) => d.name === "name")?.value
        .value as string;

      if (name) {
        validPartnerMap.set(partner.id, name);
      }
    } catch (error) {
      console.error("Error processing partner:", error);
    }
  });

  // Process builder attestations
  return builderAttestations
    .map((attestation: any) => {
      try {
        if (!attestation.data || attestation.data === "0x") {
          return null;
        }

        const decodedData = builderSchemaEncoder.decodeData(attestation.data);
        const isBuilder = decodedData.find((d) => d.name === "isBuilder")?.value
          .value as boolean;
        const context = decodedData.find((d) => d.name === "context")?.value
          .value as string;

        if (isBuilder === undefined || context === undefined) {
          return null;
        }

        // Only include attestations that reference a valid partner
        if (!attestation.refUID || !validPartnerMap.has(attestation.refUID)) {
          return null;
        }

        const partnerName = validPartnerMap.get(attestation.refUID);

        return {
          ...attestation,
          decodedData: {
            isBuilder,
            context,
          },
          partnerName,
        };
      } catch (error) {
        console.error("Error processing builder attestation:", error);
        return null;
      }
    })
    .filter(
      (
        attestation: VerifiedBuilderAttestation | null
      ): attestation is VerifiedBuilderAttestation => {
        return attestation !== null && attestation.decodedData.isBuilder;
      }
    );
}

export function getEAScanUrl(uid: string, network: Network): string {
  const baseUrl =
    network === "base"
      ? "https://base.easscan.org"
      : "https://celo.easscan.org";
  return `${baseUrl}/attestation/view/${uid}`;
}
