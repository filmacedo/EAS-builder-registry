"use client";

import { Metrics } from "@/components/Metrics";
import { Search } from "@/components/Search";
import { BuildersTable } from "@/components/BuildersTable";
import { mockMetrics, mockBuilders } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export default function Home() {
  const handleSearch = (value: string) => {
    console.log("Searching for:", value);
    // TODO: Implement search functionality
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Builder Registry</h1>
        <p className="text-muted-foreground">
          A decentralized registry that identifies and recognizes genuine
          onchain builders through verified attestations.
        </p>
      </div>

      <Metrics data={mockMetrics} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Find Builders</h2>
        <Search onSearch={handleSearch} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Verified Builders</h2>
        <BuildersTable builders={mockBuilders} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Builders</h3>
          <p className="text-muted-foreground">
            Create your Talent Protocol profile to showcase your work and get
            verified by partners.
          </p>
          <Button asChild>
            <a
              href="https://talentprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Profile
            </a>
          </Button>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">For Organizations</h3>
          <p className="text-muted-foreground">
            Become a verification partner and help identify genuine blockchain
            builders.
          </p>
          <Button asChild>
            <a
              href="https://notion.so"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply as Partner
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
