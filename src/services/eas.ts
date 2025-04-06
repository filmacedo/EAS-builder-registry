import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import {
  VerificationPartnerAttestation,
  VerifiedBuilderAttestation,
} from "@/types";

const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021"; // Base Mainnet
const PARTNER_SCHEMA_UID =
  "0x0c25f92df9ba914668f7780e428a1b5238ae7441c765fbe8b7b528f8209ef4e3";
const BUILDER_SCHEMA_UID =
  "0x597905068aedcde4321ceaf2c42e24d3bbe0af694159bececd686bf057ec7ea5";

// Initialize EAS
const eas = new EAS(EAS_CONTRACT_ADDRESS);

// Initialize provider (we'll use public RPC for now)
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

// Set the provider
eas.connect(provider);

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

export async function getVerificationPartners(): Promise<
  VerificationPartnerAttestation[]
> {
  return fetchWithRetry(async () => {
    const response = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetPartnerAttestations {
            attestations(
              where: {
                schemaId: { equals: "${PARTNER_SCHEMA_UID}" }
                revoked: { equals: false }
              }
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
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data.attestations.map((attestation: any) => ({
      ...attestation,
      decodedData: {
        name: attestation.data.name,
        url: attestation.data.url,
      },
    }));
  });
}

export async function getVerifiedBuilders(): Promise<
  VerifiedBuilderAttestation[]
> {
  return fetchWithRetry(async () => {
    // First, fetch all partner attestations to build a map
    const partnersResponse = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetPartnerAttestations {
            attestations(
              where: {
                schemaId: { equals: "${PARTNER_SCHEMA_UID}" }
                revoked: { equals: false }
              }
            ) {
              id
              attester
              recipient
              data
            }
          }
        `,
      }),
    });

    if (!partnersResponse.ok) {
      throw new Error(`HTTP error! status: ${partnersResponse.status}`);
    }

    const { data: partnersData } = await partnersResponse.json();

    // Create a map of partner attestation UIDs to their names
    const partnerMap = new Map<string, string>();
    partnersData.attestations.forEach((partner: any) => {
      try {
        if (!partner.data || partner.data === "0x") {
          return;
        }

        const decodedData = partnerSchemaEncoder.decodeData(partner.data);
        const name = decodedData.find((d) => d.name === "name")?.value
          .value as string;

        if (name) {
          partnerMap.set(partner.id, name);
        }
      } catch (error) {
        // Skip invalid partner data
      }
    });

    // Then fetch builder attestations
    const response = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetBuilderAttestations {
            attestations(
              where: {
                schemaId: { equals: "${BUILDER_SCHEMA_UID}" }
                revoked: { equals: false }
              }
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
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();

    return data.attestations
      .map((attestation: any) => {
        try {
          if (!attestation.data || attestation.data === "0x") {
            return null;
          }

          const decodedData = builderSchemaEncoder.decodeData(attestation.data);
          const isBuilder = decodedData.find((d) => d.name === "isBuilder")
            ?.value.value as boolean;
          const context = decodedData.find((d) => d.name === "context")?.value
            .value as string;

          if (isBuilder === undefined || context === undefined) {
            return null;
          }

          const partnerName = attestation.refUID
            ? partnerMap.get(attestation.refUID)
            : "Unknown";

          return {
            ...attestation,
            decodedData: {
              isBuilder,
              context,
            },
            partnerName,
          };
        } catch (error) {
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
  });
}

export function getEAScanUrl(uid: string): string {
  return `https://base.easscan.org/attestation/view/${uid}`;
}
