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
    return data.attestations.map((attestation: any) => ({
      ...attestation,
      decodedData: {
        isBuilder: attestation.data.isBuilder,
        context: attestation.data.context,
      },
    }));
  } catch (error) {
    console.error("Error fetching verified builders:", error);
    return [];
  }
}

export function getEAScanUrl(uid: string): string {
  return `https://base.easscan.org/attestation/view/${uid}`;
}
