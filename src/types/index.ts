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
}

export interface VerificationPartnerAttestation extends EASAttestation {
  decodedData: {
    name: string;
    url: string;
  };
}

export interface VerifiedBuilderAttestation extends EASAttestation {
  decodedData: {
    isBuilder: boolean;
    context: string;
  };
}

export interface Builder {
  id: string;
  address: string;
  ens?: string;
  attestations: VerifiedBuilderAttestation[];
  totalVerifications: number;
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
