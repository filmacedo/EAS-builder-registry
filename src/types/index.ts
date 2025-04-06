export interface Builder {
  id: string;
  address: string;
  ens?: string;
  verificationDate: string;
  totalVerifications: number;
  context: string;
  verifier: string;
}

export interface Partner {
  id: string;
  name: string;
  url: string;
  verifiedBuildersCount: number;
}

export interface Metrics {
  totalBuilders: number;
  totalPartners: number;
  totalAttestations: number;
}
