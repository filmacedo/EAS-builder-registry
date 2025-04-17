import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const TALENT_API_URL = "https://api.talentprotocol.com/profile";

const getTalentProfile = unstable_cache(
  async (address: string) => {
    const response = await fetch(
      `${TALENT_API_URL}?source=wallet&id=${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.TALENT_API_KEY || "",
        },
      }
    );

    if (response.status === 404) {
      return {};
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
  ["talent-profile"],
  { revalidate: 86400 } // 24 hours
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const data = await getTalentProfile(address);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Talent Protocol profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch Talent Protocol profile" },
      { status: 500 }
    );
  }
}
