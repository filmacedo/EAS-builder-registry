import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getEASData = unstable_cache(
  async (query: string) => {
    const response = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
  ["eas-query"],
  { revalidate: 300 } // 5 minutes
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await getEASData(body.query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from EAS:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from EAS" },
      { status: 500 }
    );
  }
}
