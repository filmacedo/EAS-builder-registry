import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import {
  VerificationPartnerAttestation,
  VerifiedBuilderAttestation,
} from "@/types";
import { resolveAddresses } from "./ens";

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Base Mainnet
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

async function fetchFromEAS(query: string) {
  const response = await fetch("/api/eas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getVerificationPartners(): Promise<
  VerificationPartnerAttestation[]
> {
  return fetchWithRetry(async () => {
    const { data } = await fetchFromEAS(`
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
    `);

    // First decode the attestations
    const decodedAttestations = data.attestations.map((attestation: any) => {
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

    // Then resolve ENS names for all partners
    const partnerAddresses = decodedAttestations
      .filter((a: VerificationPartnerAttestation) => a.decodedData !== null)
      .map((a: VerificationPartnerAttestation) => a.recipient);
    const ensMap = await resolveAddresses(partnerAddresses);

    // Finally, add ENS names to the decoded attestations
    return decodedAttestations.map(
      (attestation: VerificationPartnerAttestation) => {
        if (!attestation.decodedData) return attestation;
        return {
          ...attestation,
          decodedData: {
            ...attestation.decodedData,
            ens: ensMap.get(attestation.recipient),
          },
        };
      }
    );
  });
}

export async function getVerifiedBuilders(): Promise<
  VerifiedBuilderAttestation[]
> {
  return fetchWithRetry(async () => {
    // First, fetch all partner attestations to build a map
    const { data: partnersData } = await fetchFromEAS(`
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
    `);

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

    // Then fetch builder attestations with pagination
    const { data } = await fetchFromEAS(`
      query GetBuilderAttestations {
        attestations(
          where: {
            schemaId: { equals: "${BUILDER_SCHEMA_UID}" }
            revoked: { equals: false }
          }
          take: 1000
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
