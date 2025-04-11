import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes
const CACHE_TAGS = ["eas-registry"];
const REQUEST_TIMEOUT = 5000; // 5 seconds

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  latency: number[];
  lastErrors: Array<{ timestamp: string; error: string }>;
}

// In-memory metrics (resets on deployment)
const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
  latency: [],
  lastErrors: [],
};

// Keep only last 100 latency samples and last 10 errors
function updateMetrics(
  type: "hit" | "miss" | "error",
  latency?: number,
  error?: string
) {
  if (type === "hit") metrics.hits++;
  if (type === "miss") metrics.misses++;
  if (type === "error") {
    metrics.errors++;
    metrics.lastErrors.unshift({
      timestamp: new Date().toISOString(),
      error: error || "Unknown error",
    });
    if (metrics.lastErrors.length > 10) metrics.lastErrors.pop();
  }
  if (latency) {
    metrics.latency.push(latency);
    if (metrics.latency.length > 100) metrics.latency.shift();
  }
}

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

async function fetchFromEAS(query: string) {
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
    updateMetrics("hit", duration);

    return {
      data,
      performance: {
        latencyMs: Math.round(duration),
        cached: true,
      },
    };
  } catch (error) {
    const duration = performance.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    updateMetrics("error", duration, errorMessage);
    throw error;
  }
}

const getCachedEASData = unstable_cache(
  async (query: string) => {
    try {
      return await fetchFromEAS(query);
    } catch (error) {
      updateMetrics("miss");
      // Attempt direct fetch on cache miss
      return await fetchFromEAS(query);
    }
  },
  ["eas-query"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: CACHE_TAGS,
  }
);

// Monitoring endpoint
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!url.pathname.endsWith("/metrics")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const avgLatency = metrics.latency.length
    ? Math.round(
        metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length
      )
    : 0;

  const p95Latency = metrics.latency.length
    ? Math.round(
        metrics.latency.sort((a, b) => a - b)[
          Math.floor(metrics.latency.length * 0.95)
        ]
      )
    : 0;

  return NextResponse.json({
    cache: {
      hits: metrics.hits,
      misses: metrics.misses,
      hitRate: metrics.hits / (metrics.hits + metrics.misses) || 0,
      errors: metrics.errors,
      errorRate: metrics.errors / (metrics.hits + metrics.misses) || 0,
    },
    performance: {
      avgLatencyMs: avgLatency,
      p95LatencyMs: p95Latency,
      sampleSize: metrics.latency.length,
    },
    lastErrors: metrics.lastErrors,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const start = performance.now();

  try {
    const body = await request.json();

    if (!body.query) {
      throw new Error("Missing query parameter");
    }

    const result = await getCachedEASData(body.query);
    return NextResponse.json(result);
  } catch (error) {
    const duration = performance.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    updateMetrics("error", duration, errorMessage);

    return NextResponse.json(
      {
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
      },
      {
        status:
          error instanceof Error && error.name === "AbortError" ? 504 : 500,
      }
    );
  }
}
