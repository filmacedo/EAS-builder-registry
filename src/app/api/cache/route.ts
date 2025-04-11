import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { metricsManager } from "./metrics";
import type { CacheResponse, CacheErrorResponse, EASResponse } from "./types";

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes
const CACHE_TAGS = ["eas-registry"];
const REQUEST_TIMEOUT = 5000; // 5 seconds
const CACHE_STALE_WHILE_REVALIDATE = 60 * 60; // 1 hour

/**
 * Fetches data with a timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetches data from EAS with performance monitoring
 */
async function fetchFromEAS(query: string): Promise<EASResponse> {
  const start = performance.now();

  try {
    const response = await fetchWithTimeout(
      "https://base.easscan.org/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const duration = performance.now() - start;
    metricsManager.updateMetrics("hit", duration);

    return data;
  } catch (error) {
    const duration = performance.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    metricsManager.updateMetrics("error", duration, errorMessage);
    throw error;
  }
}

/**
 * Cached version of EAS data fetching with stale-while-revalidate
 */
const getCachedEASData = unstable_cache(
  async (query: string) => {
    try {
      const result = await fetchFromEAS(query);
      const timestamp = Date.now();

      return {
        data: result,
        timestamp,
        cacheStatus: "HIT" as const,
      };
    } catch (error) {
      metricsManager.updateMetrics("error");
      throw error;
    }
  },
  ["eas-query"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: CACHE_TAGS,
  }
);

/**
 * GET endpoint for metrics
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!url.pathname.endsWith("/metrics")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(metricsManager.getMetrics());
}

/**
 * POST endpoint for cached data retrieval
 */
export async function POST(request: Request) {
  const start = performance.now();

  try {
    const body = await request.json();

    if (!body.query) {
      throw new Error("Missing query parameter");
    }

    const result = await getCachedEASData(body.query);
    const now = Date.now();
    const age = now - result.timestamp;

    // Determine if we need background revalidation
    const needsRevalidation = age > CACHE_REVALIDATE_SECONDS * 1000;

    if (needsRevalidation && age < CACHE_STALE_WHILE_REVALIDATE * 1000) {
      // Trigger background revalidation
      getCachedEASData(body.query).catch(console.error);
    }

    const duration = performance.now() - start;
    const response: CacheResponse<EASResponse> = {
      data: result.data,
      metrics: {
        totalTime: duration,
        cached: true,
        age: age,
        stale: needsRevalidation,
      },
      cacheStatus: result.cacheStatus,
    };

    return NextResponse.json(response, {
      headers: {
        "x-cache-status": result.cacheStatus,
        "x-cache-timestamp": new Date(result.timestamp).toISOString(),
        "x-cache-ttl": `${CACHE_REVALIDATE_SECONDS}s`,
        "x-cache-age": `${Math.floor(age / 1000)}s`,
        "Cache-Control": `s-maxage=${CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      },
    });
  } catch (error) {
    const duration = performance.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    metricsManager.updateMetrics("error", duration, errorMessage);

    const errorResponse: CacheErrorResponse = {
      error: {
        message: errorMessage,
        code:
          error instanceof Error && error.name === "AbortError"
            ? "TIMEOUT"
            : "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
      performance: {
        latencyMs: Math.round(duration),
        cached: false,
      },
    };

    return NextResponse.json(errorResponse, {
      status: error instanceof Error && error.name === "AbortError" ? 504 : 500,
      headers: {
        "x-cache-status": "ERROR",
        "x-cache-timestamp": new Date().toISOString(),
      },
    });
  }
}
