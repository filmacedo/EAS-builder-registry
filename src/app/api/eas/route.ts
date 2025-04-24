import { NextResponse } from "next/server";
import { Network } from "@/types";

export async function POST(request: Request) {
  try {
    const { query, network }: { query: string; network: Network } =
      await request.json();

    if (!query || !network) {
      return NextResponse.json(
        { error: "Query and network are required" },
        { status: 400 }
      );
    }

    const baseUrl =
      network === "base"
        ? "https://base.easscan.org"
        : "https://celo.easscan.org";

    const response = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error(`HTTP error from ${network} network:`, {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: `HTTP error from ${network} network` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in EAS API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
