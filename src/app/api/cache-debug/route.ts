import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export async function GET() {
  const cacheStats = await unstable_cache(
    async () => ({
      timestamp: Date.now(),
      test: "cache-test",
    }),
    ["cache-test"],
    {
      revalidate: 300,
      tags: ["debug"],
    }
  )();

  return NextResponse.json({
    stats: cacheStats,
    time: new Date().toISOString(),
  });
}
