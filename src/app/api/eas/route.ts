import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getEASData = unstable_cache(
  async (query: string) => {
    try {
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

      const data = await response.json();

      // Validate the response structure
      if (!data || !data.data) {
        console.error("Invalid response from EAS:", data);
        throw new Error("Invalid response structure from EAS GraphQL");
      }

      return data;
    } catch (error) {
      console.error("Error in getEASData:", error);
      throw error;
    }
  },
  ["eas-query"],
  { revalidate: 300 } // 5 minutes
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const data = await getEASData(body.query);

    // Ensure we have the expected data structure
    if (!data.data || (!data.data.partners && !data.data.builders)) {
      console.error("Invalid data structure from EAS:", data);
      return NextResponse.json(
        { error: "Invalid response structure from EAS", data: null },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in EAS API route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch data from EAS",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
