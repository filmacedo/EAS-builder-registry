export type Network = "base" | "celo";

export interface EASAttestation {
  id: string;
  attester: string;
  recipient: string;
  refUID: string | null;
  revocationTime: number | null;
  expirationTime: number | null;
  time: number;
  txid: string;
  data: string;
  network: Network;
}

export interface VerificationPartnerAttestation extends EASAttestation {
  decodedData: {
    name: string;
    url: string;
    ens?: string;
  } | null;
}

export interface VerifiedBuilderAttestation extends EASAttestation {
  decodedData: {
    isBuilder: boolean;
    context: string;
  };
  partnerName?: string;
}

export interface Builder {
  id: string;
  address: string;
  ens?: string;
  attestations: VerifiedBuilderAttestation[];
  totalVerifications: number;
  earliestAttestationDate: number;
  earliestAttestationId: string;
  earliestPartnerName: string;
  earliestPartnerAttestationId?: string | null;
  context: string | null | undefined;
}

export interface Partner {
  id: string;
  address: string;
  name: string;
  url: string;
  attestationUID: string;
  verifiedBuildersCount: number;
}

export interface Metrics {
  totalBuilders: number;
  totalPartners: number;
  totalAttestations: number;
}

export interface ProcessedBuilder {
  id: string;
  address: `0x${string}`;
  ens?: string;
  displayName?: string;
  builderScore?: number | null;
  totalVerifications: number;
  earliestAttestationDate: number;
  earliestAttestationId: string;
  earliestAttestationNetwork: Network;
  earliestPartnerName: string;
  earliestPartnerAttestationId?: string | null;
  earliestPartnerNetwork?: Network;
  context: string | null | undefined;
  attestations: VerifiedBuilderAttestation[];
}

export interface ProcessedPartner {
  id: string;
  address: `0x${string}`;
  name: string;
  url: string;
  attestationUID: string;
  verifiedBuildersCount: number;
  network: Network;
}
