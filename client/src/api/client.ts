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
const BOOTSTRAP_API_BASE_URL = import.meta.env.VITE_BOOTSTRAP_API_URL || '/api/v2';

// =============================================================================
// AUTH TOKEN MANAGEMENT
// =============================================================================

// Store for the getToken function from Clerk
let getTokenFn: (() => Promise<string | null>) | null = null;
let tokenPromise: Promise<string | null> | null = null;

/**
 * Set the getToken function from Clerk's useAuth hook.
 * This should be called once when the app initializes with Clerk.
 */
export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
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

  if (!tokenPromise) {
    tokenPromise = getTokenFn().finally(() => {
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
