type CacheEntry<T> = {
  value: T;
  fetchedAt: number;
  refreshPromise?: Promise<T>;
};

const roasterCache = new Map<string, CacheEntry<unknown>>();

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

const ttlMs = parsePositiveInt(process.env.ROASTER_CACHE_TTL_MS, 300_000);
const staleWhileRevalidateMs = parsePositiveInt(
  process.env.ROASTER_CACHE_SWR_MS,
  300_000
);

const startRefresh = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const existing = roasterCache.get(key) as CacheEntry<T> | undefined;

  if (existing?.refreshPromise) {
    return existing.refreshPromise;
  }

  const refreshPromise = fetcher()
    .then((value) => {
      roasterCache.set(key, {
        value,
        fetchedAt: Date.now(),
      });
      return value;
    })
    .finally(() => {
      const latest = roasterCache.get(key) as CacheEntry<T> | undefined;
      if (latest?.refreshPromise) {
        delete latest.refreshPromise;
      }
    });

  roasterCache.set(key, {
    value: existing?.value as T,
    fetchedAt: existing?.fetchedAt ?? 0,
    refreshPromise,
  });

  return refreshPromise;
};

export const getRoastersWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ value: T; fromCache: boolean }> => {
  const now = Date.now();
  const cached = roasterCache.get(key) as CacheEntry<T> | undefined;

  if (!cached) {
    const value = await startRefresh(key, fetcher);
    return { value, fromCache: false };
  }

  const ageMs = now - cached.fetchedAt;

  if (ageMs <= ttlMs && cached.value !== undefined) {
    return { value: cached.value, fromCache: true };
  }

  const maxStaleAge = ttlMs + staleWhileRevalidateMs;
  if (ageMs <= maxStaleAge && cached.value !== undefined) {
    void startRefresh(key, fetcher).catch((error: unknown) => {
      console.error('Failed to refresh roaster cache', { key, error });
    });

    return { value: cached.value, fromCache: true };
  }

  const value = await startRefresh(key, fetcher);
  return { value, fromCache: false };
};

export const clearRoasterCache = () => {
  roasterCache.clear();
};

export const clearRoasterCacheForUser = (userId: string) => {
  const suffix = `:${userId}`;
  for (const key of roasterCache.keys()) {
    if (key.endsWith(suffix)) {
      roasterCache.delete(key);
    }
  }
};
