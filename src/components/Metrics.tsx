import type { Metrics } from "@/types";

interface MetricsProps {
  data: Metrics;
}

export function Metrics({ data }: MetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 py-8">
      <div className="rounded-lg border p-6 bg-background">
        <p className="text-4xl font-bold mb-2">{data.totalAttestations}</p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Attestations
        </h3>
      </div>
      <div className="rounded-lg border p-6 bg-background">
        <p className="text-4xl font-bold mb-2">{data.totalBuilders}</p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Verified Builders
        </h3>
      </div>
      <div className="rounded-lg border p-6 bg-background">
        <p className="text-4xl font-bold mb-2">{data.totalPartners}</p>
        <h3 className="text-sm font-medium text-muted-foreground">
          Verification Partners
        </h3>
      </div>
    </div>
  );
}
