import { Builder, Partner, Metrics } from "@/types";

export const mockBuilders: Builder[] = [
  {
    id: "1",
    address: "0x1234...5678",
    ens: "builder1.eth",
    verificationDate: "2024-04-01",
    totalVerifications: 3,
    context: "Built the frontend for XYZ protocol",
    verifier: "Talent Protocol",
  },
  {
    id: "2",
    address: "0x2345...6789",
    verificationDate: "2024-04-02",
    totalVerifications: 2,
    context: "Developed smart contracts for ABC project",
    verifier: "Gitcoin",
  },
  {
    id: "3",
    address: "0x3456...7890",
    ens: "builder3.eth",
    verificationDate: "2024-04-03",
    totalVerifications: 1,
    context: "Created documentation for DEF protocol",
    verifier: "Talent Protocol",
  },
];

export const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Talent Protocol",
    url: "https://talentprotocol.com",
    verifiedBuildersCount: 150,
  },
  {
    id: "2",
    name: "Gitcoin",
    url: "https://gitcoin.co",
    verifiedBuildersCount: 200,
  },
  {
    id: "3",
    name: "ETHGlobal",
    url: "https://ethglobal.com",
    verifiedBuildersCount: 100,
  },
];

export const mockMetrics: Metrics = {
  totalBuilders: 5000,
  totalPartners: 3,
  totalAttestations: 450,
};
