export interface CacheResponse<T> {
  data: T;
  metrics: {
    totalTime: number;
    cached: boolean;
  };
  cacheStatus: "HIT" | "MISS" | "ERROR" | "UNKNOWN";
}

export interface CacheErrorResponse {
  error: {
    message: string;
    code: "TIMEOUT" | "INTERNAL_ERROR";
    timestamp: string;
  };
  performance: {
    latencyMs: number;
    cached: boolean;
  };
}

export interface EASResponse {
  data: {
    attestations: Array<{
      id: string;
      attester: string;
      recipient: string;
      data: string;
      [key: string]: any;
    }>;
  };
}
