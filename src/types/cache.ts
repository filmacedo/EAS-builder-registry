export interface CacheMetrics {
  totalTime: number;
  cached: boolean;
  age?: number;
  stale?: boolean;
}
