import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const TALENT_API_URL = "https://api.talentprotocol.com/score";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Structured logging helper
function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack: error.stack,
            }
          : error,
      ...metadata,
    })
  );
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // If we get a 404, return empty object
    if (response.status === 404) {
      return new Response(JSON.stringify({}), { status: 200 });
    }

    // If we get a 429 (rate limit) or 5xx error, retry
    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      logError(
        "TalentProtocolAPI",
        new Error(`Retrying due to status ${response.status}`),
        {
          url,
          status: response.status,
          retriesLeft: retries - 1,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      logError("TalentProtocolAPI", error, {
        url,
        retriesLeft: retries - 1,
      });

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

const getTalentScore = unstable_cache(
  async (address: string) => {
    const response = await fetchWithRetry(
      `${TALENT_API_URL}?source=wallet&id=${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.TALENT_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
  ["talent-score"],
  { revalidate: 86400 } // 24 hours
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  if (!process.env.TALENT_API_KEY) {
    // Return empty response instead of error - Talent Protocol is optional
    return NextResponse.json({}, { status: 200 });
  }

  try {
    const data = await getTalentScore(address);
    return NextResponse.json(data);
  } catch (error) {
    logError("TalentProtocolAPI", error, {
      address,
      url: request.url,
    });

    return NextResponse.json(
      { error: "Failed to fetch Talent Protocol score" },
      { status: 500 }
    );
  }
}
