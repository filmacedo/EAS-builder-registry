import { NextResponse } from "next/server";

const TALENT_API_URL = "https://api.talentprotocol.com/profile";

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
      return NextResponse.json({});
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Talent Protocol profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch Talent Protocol profile" },
      { status: 500 }
    );
  }
}
