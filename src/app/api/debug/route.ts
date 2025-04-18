import { NextResponse } from "next/server";

// Only allow debug endpoint in development
export const dynamic = "force-dynamic";

export async function GET() {
  // Only allow access in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasTalentApiKey: !!process.env.TALENT_API_KEY,
    // Don't expose the actual API key
    talentApiKeyLength: process.env.TALENT_API_KEY?.length || 0,
    // Add other useful debug info
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
}
