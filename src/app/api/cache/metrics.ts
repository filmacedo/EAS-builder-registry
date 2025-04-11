interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  latency: number[];
  lastErrors: Array<{ timestamp: string; error: string }>;
  startTime: number;
}

class MetricsManager {
  private metrics: CacheMetrics;
  private static MAX_LATENCY_SAMPLES = 100;
  private static MAX_ERROR_SAMPLES = 10;

  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      latency: [],
      lastErrors: [],
      startTime: Date.now(),
    };
  }

  updateMetrics(
    type: "hit" | "miss" | "error",
    latency?: number,
    error?: string
  ) {
    if (type === "hit") this.metrics.hits++;
    if (type === "miss") this.metrics.misses++;
    if (type === "error") {
      this.metrics.errors++;
      this.metrics.lastErrors.unshift({
        timestamp: new Date().toISOString(),
        error: error || "Unknown error",
      });
      if (this.metrics.lastErrors.length > MetricsManager.MAX_ERROR_SAMPLES) {
        this.metrics.lastErrors.pop();
      }
    }
    if (latency) {
      this.metrics.latency.push(latency);
      if (this.metrics.latency.length > MetricsManager.MAX_LATENCY_SAMPLES) {
        this.metrics.latency.shift();
      }
    }
  }

  getMetrics() {
    const avgLatency = this.metrics.latency.length
      ? Math.round(
          this.metrics.latency.reduce((a, b) => a + b, 0) /
            this.metrics.latency.length
        )
      : 0;

    const p95Latency = this.metrics.latency.length
      ? Math.round(
          this.metrics.latency.sort((a, b) => a - b)[
            Math.floor(this.metrics.latency.length * 0.95)
          ]
        )
      : 0;

    return {
      cache: {
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate:
          this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
        errors: this.metrics.errors,
        errorRate:
          this.metrics.errors / (this.metrics.hits + this.metrics.misses) || 0,
      },
      performance: {
        avgLatencyMs: avgLatency,
        p95LatencyMs: p95Latency,
        sampleSize: this.metrics.latency.length,
      },
      lastErrors: this.metrics.lastErrors,
      timestamp: new Date().toISOString(),
    };
  }

  getRawMetrics() {
    return this.metrics;
  }
}

export const metricsManager = new MetricsManager();
