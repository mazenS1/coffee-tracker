import type {
  Coffee,
  Cup,
  Roaster,
  CreateCoffeeInput,
  UpdateCoffeeInput,
  CreateCupInput,
  UpdateCupInput,
  CreateRoasterInput,
  PaginatedResponse,
  SingleResponse,
  CoffeeStats,
  CoffeeQueryParams,
  BootstrapQueryParams,
  BootstrapResponse,
} from '@coffee-tracker/shared';

// Use relative URL to go through Vite's proxy in development
// This allows the app to work from any device on the network
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BOOTSTRAP_API_BASE_URL = (() => {
  const explicitBootstrapUrl = import.meta.env.VITE_BOOTSTRAP_API_URL as
    | string
    | undefined;
  if (explicitBootstrapUrl) {
    return explicitBootstrapUrl;
  }

  // Derive v2 endpoint from configured v1 base to avoid cross-origin/path mismatches.
  if (/\/api\/v1\/?$/i.test(API_BASE_URL)) {
    return API_BASE_URL.replace(/\/api\/v1\/?$/i, '/api/v2');
  }

  if (/\/v1\/?$/i.test(API_BASE_URL)) {
    return API_BASE_URL.replace(/\/v1\/?$/i, '/v2');
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/v2`;
})();

// =============================================================================
// AUTH TOKEN MANAGEMENT
// =============================================================================

// Store for the getToken function from Clerk
let getTokenFn: (() => Promise<string | null>) | null = null;
let tokenPromise: Promise<string | null> | null = null;
let cachedToken: { value: string | null; expiresAt: number } | null = null;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

const AUTH_TOKEN_CACHE_TTL_MS = parsePositiveInt(
  import.meta.env.VITE_AUTH_TOKEN_CACHE_TTL_MS as string | undefined,
  30_000,
);

/**
 * Set the getToken function from Clerk's useAuth hook.
 * This should be called once when the app initializes with Clerk.
 */
export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
  tokenPromise = null;
  cachedToken = null;
}

// =============================================================================
// API CLIENT
// =============================================================================

class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getAuthToken(): Promise<string | null> {
  if (!getTokenFn) return null;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  if (!tokenPromise) {
    tokenPromise = getTokenFn()
      .then((token) => {
        cachedToken = {
          value: token,
          expiresAt: Date.now() + AUTH_TOKEN_CACHE_TTL_MS,
        };
        return token;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }

  return tokenPromise;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  // Get auth token from Clerk if available
  const token = await getAuthToken();
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include', // For cookies/auth
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP error ${response.status}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const bootstrapApi = {
  get: (params?: BootstrapQueryParams): Promise<BootstrapResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.includeRoasters !== undefined) {
      searchParams.set('includeRoasters', String(params.includeRoasters));
    }

    const query = searchParams.toString();
    return fetchApi(
      `/bootstrap${query ? `?${query}` : ''}`,
      {},
      BOOTSTRAP_API_BASE_URL
    );
  },
};

// =============================================================================
// COFFEE API
// =============================================================================

export const coffeeApi = {
  getAll: (params?: CoffeeQueryParams): Promise<PaginatedResponse<Coffee>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.roastLevel) searchParams.set('roastLevel', params.roastLevel);

    const query = searchParams.toString();
    return fetchApi(`/coffees${query ? `?${query}` : ''}`);
  },

  getById: (id: string): Promise<SingleResponse<Coffee>> => {
    return fetchApi(`/coffees/${id}`);
  },

  create: (data: CreateCoffeeInput): Promise<SingleResponse<Coffee>> => {
    return fetchApi('/coffees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateCoffeeInput): Promise<SingleResponse<Coffee>> => {
    return fetchApi(`/coffees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<void> => {
    return fetchApi(`/coffees/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: (): Promise<SingleResponse<CoffeeStats>> => {
    return fetchApi('/coffees/stats');
  },
};

// =============================================================================
// CUP API
// =============================================================================

export const cupApi = {
  getAll: (coffeeId?: string): Promise<PaginatedResponse<Cup>> => {
    const params = coffeeId ? `?coffeeId=${coffeeId}` : '';
    return fetchApi(`/cups${params}`);
  },

  getById: (id: string): Promise<SingleResponse<Cup>> => {
    return fetchApi(`/cups/${id}`);
  },

  create: (data: CreateCupInput): Promise<SingleResponse<Cup>> => {
    return fetchApi('/cups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateCupInput): Promise<SingleResponse<Cup>> => {
    return fetchApi(`/cups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<void> => {
    return fetchApi(`/cups/${id}`, {
      method: 'DELETE',
    });
  },
};

// =============================================================================
// ROASTER API
// =============================================================================

export const roasterApi = {
  getAll: (): Promise<PaginatedResponse<Roaster>> => {
    return fetchApi('/roasters');
  },

  getById: (id: string): Promise<SingleResponse<Roaster>> => {
    return fetchApi(`/roasters/${id}`);
  },

  create: (data: CreateRoasterInput): Promise<SingleResponse<Roaster>> => {
    return fetchApi('/roasters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<CreateRoasterInput>): Promise<SingleResponse<Roaster>> => {
    return fetchApi(`/roasters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<void> => {
    return fetchApi(`/roasters/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
