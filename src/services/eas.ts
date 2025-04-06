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

export async function getVerificationPartners(): Promise<
  VerificationPartnerAttestation[]
> {
  try {
    // Note: We'll need to implement a custom GraphQL query here
    // as the EAS SDK doesn't provide a direct method for this
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

    const { data } = await response.json();
    return data.attestations.map((attestation: any) => ({
      ...attestation,
      decodedData: {
        name: attestation.data.name,
        url: attestation.data.url,
      },
    }));
  } catch (error) {
    console.error("Error fetching verification partners:", error);
    return [];
  }
}

export async function getVerifiedBuilders(): Promise<
  VerifiedBuilderAttestation[]
> {
  try {
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

    const { data: partnersData } = await partnersResponse.json();

    // Create a map of partner attestation UIDs to their names
    const partnerMap = new Map<string, string>();
    partnersData.attestations.forEach((partner: any) => {
      try {
        // Skip if data is empty or invalid
        if (!partner.data || partner.data === "0x") {
          console.warn("Skipping partner with empty data:", partner.id);
          return;
        }

        // Decode the data using the schema encoder
        const decodedData = partnerSchemaEncoder.decodeData(partner.data);

        // Get the name from the decoded data
        const name = decodedData.find((d) => d.name === "name")?.value
          .value as string;

        if (name) {
          partnerMap.set(partner.id, name);
          console.log("Mapped partner:", partner.id, "->", name);
        } else {
          console.warn("Partner data missing name:", partner.id, decodedData);
        }
      } catch (error) {
        console.error("Error decoding partner data:", error, partner);
      }
    });

    console.log("Partner map size:", partnerMap.size);
    console.log("Partner map entries:", Array.from(partnerMap.entries()));

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

    const { data } = await response.json();

    // Filter out non-builder attestations and map the data
    return data.attestations
      .map((attestation: any) => {
        try {
          // Skip if data is empty or invalid
          if (!attestation.data || attestation.data === "0x") {
            console.warn(
              "Skipping attestation with empty data:",
              attestation.id
            );
            return null;
          }

          // Decode the data using the schema encoder
          const decodedData = builderSchemaEncoder.decodeData(attestation.data);

          // Convert the decoded data to our expected format
          const isBuilder = decodedData.find((d) => d.name === "isBuilder")
            ?.value.value as boolean;
          const context = decodedData.find((d) => d.name === "context")?.value
            .value as string;

          if (isBuilder === undefined || context === undefined) {
            console.warn(
              "Invalid decoded data for attestation:",
              attestation.id
            );
            return null;
          }

          // Get partner name from the map
          const partnerName = attestation.refUID
            ? partnerMap.get(attestation.refUID)
            : "Unknown";

          console.log("Builder attestation:", {
            id: attestation.id,
            refUID: attestation.refUID,
            partnerName,
            partnerMapSize: partnerMap.size,
          });

          return {
            ...attestation,
            decodedData: {
              isBuilder,
              context,
            },
            partnerName,
          };
        } catch (error) {
          console.error("Error decoding attestation data:", error, attestation);
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
  } catch (error) {
    console.error("Error fetching verified builders:", error);
    return [];
  }
}

export function getEAScanUrl(uid: string): string {
  return `https://base.easscan.org/attestation/view/${uid}`;
}
