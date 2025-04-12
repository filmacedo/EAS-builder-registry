import { Builder, Partner, Metrics } from "@/types";

export const mockBuilders: Builder[] = [
  {
    id: "1",
    address: "0x1234...5678",
    ens: "builder1.eth",
    attestations: [
      {
        id: "attestation1",
        attester: "0x1234...5678",
        recipient: "0x1234...5678",
        refUID: null,
        revocationTime: null,
        expirationTime: null,
        time: Date.now(),
        txid: "0x1234...5678",
        data: "0x1234...5678",
        decodedData: {
          isBuilder: true,
          context: "Built the frontend for XYZ protocol",
        },
        partnerName: "Talent Protocol",
      },
    ],
    totalVerifications: 3,
    earliestAttestationDate: Date.now(),
    earliestAttestationId: "attestation1",
    earliestPartnerName: "Talent Protocol",
    earliestPartnerAttestationId: null,
    context: "Built the frontend for XYZ protocol",
  },
  {
    id: "2",
    address: "0x2345...6789",
    attestations: [
      {
        id: "attestation2",
        attester: "0x2345...6789",
        recipient: "0x2345...6789",
        refUID: null,
        revocationTime: null,
        expirationTime: null,
        time: Date.now(),
        txid: "0x2345...6789",
        data: "0x2345...6789",
        decodedData: {
          isBuilder: true,
          context: "Developed smart contracts for ABC project",
        },
        partnerName: "Gitcoin",
      },
    ],
    totalVerifications: 2,
    earliestAttestationDate: Date.now(),
    earliestAttestationId: "attestation2",
    earliestPartnerName: "Gitcoin",
    earliestPartnerAttestationId: null,
    context: "Developed smart contracts for ABC project",
  },
  {
    id: "3",
    address: "0x3456...7890",
    ens: "builder3.eth",
    attestations: [
      {
        id: "attestation3",
        attester: "0x3456...7890",
        recipient: "0x3456...7890",
        refUID: null,
        revocationTime: null,
        expirationTime: null,
        time: Date.now(),
        txid: "0x3456...7890",
        data: "0x3456...7890",
        decodedData: {
          isBuilder: true,
          context: "Created documentation for DEF protocol",
        },
        partnerName: "Talent Protocol",
      },
    ],
    totalVerifications: 1,
    earliestAttestationDate: Date.now(),
    earliestAttestationId: "attestation3",
    earliestPartnerName: "Talent Protocol",
    earliestPartnerAttestationId: null,
    context: "Created documentation for DEF protocol",
  },
];

export const mockPartners: Partner[] = [
  {
    id: "1",
    address: "0x1234...5678",
    name: "Talent Protocol",
    url: "https://talentprotocol.com",
    attestationUID: "0x1234...5678",
    verifiedBuildersCount: 150,
  },
  {
    id: "2",
    address: "0x2345...6789",
    name: "Gitcoin",
    url: "https://gitcoin.co",
    attestationUID: "0x2345...6789",
    verifiedBuildersCount: 200,
  },
  {
    id: "3",
    address: "0x3456...7890",
    name: "ETHGlobal",
    url: "https://ethglobal.com",
    attestationUID: "0x3456...7890",
    verifiedBuildersCount: 100,
  },
];

export const mockMetrics: Metrics = {
  totalBuilders: 5000,
  totalPartners: 3,
  totalAttestations: 450,
};
