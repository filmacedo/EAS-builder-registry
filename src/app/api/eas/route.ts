import { NextResponse } from "next/server";
import { Network } from "@/types";

export async function POST(request: Request) {
  try {
    // Check if request has a body
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // Safely parse JSON body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { query, network }: { query: string; network: Network } = body;

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
