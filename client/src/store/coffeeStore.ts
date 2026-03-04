import { create } from 'zustand';
import type {
  Coffee,
  Cup,
  Roaster,
  CreateCoffeeInput,
  UpdateCoffeeInput,
  CreateCupInput,
  UpdateCupInput,
} from '@coffee-tracker/shared';
import { ApiError, bootstrapApi, coffeeApi, cupApi, roasterApi } from '../api/client';
import { setHotCoffeeId } from '../lib/hotCoffee';

const ROASTER_CACHE_TTL_MS = 300_000;
const DEFAULT_FIRST_PAGE_LIMIT = 20;
let coffeesRequestSeq = 0;
const prefetchCoffeeRequests = new Map<string, Promise<void>>();

const getCoffeeCupCount = (
  coffee: Pick<Coffee, '_count' | 'cups'> | null | undefined
): number => coffee?._count?.cups ?? coffee?.cups?.length ?? 0;

// =============================================================================
// STORE STATE
// =============================================================================

interface CoffeeStore {
  // Data
  sessionUserId: string | null;
  coffees: Coffee[];
  prefetchedCoffeeById: Record<string, Coffee>;
  roasters: Roaster[];
  roastersFetchedAt: number | null;
  roastersUserId: string | null;
  selectedCoffeeId: string | null;
  selectedCoffee: Coffee | null;
  bootstrapCursor: string | null;

  // Loading states
  isLoading: boolean;
  isLoadingCoffee: boolean;
  error: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Actions - Coffees
  fetchBootstrap: (params?: {
    limit?: number;
    cursor?: string;
    includeRoasters?: boolean;
  }) => Promise<void>;
  prefetchCoffeeById: (id: string) => Promise<void>;
  fetchCoffees: (params?: { page?: number; search?: string }) => Promise<void>;
  fetchCoffeeById: (id: string) => Promise<void>;
  addCoffee: (coffee: CreateCoffeeInput) => Promise<Coffee | undefined>;
  updateCoffee: (id: string, updates: UpdateCoffeeInput) => Promise<void>;
  deleteCoffee: (id: string) => Promise<void>;

  // Actions - Cups
  addCup: (cup: CreateCupInput) => Promise<Cup | undefined>;
  updateCup: (id: string, updates: UpdateCupInput) => Promise<void>;
  deleteCup: (id: string) => Promise<void>;

  // Actions - Roasters
  fetchRoasters: (options?: { force?: boolean }) => Promise<void>;
  addRoaster: (name: string) => Promise<Roaster | undefined>;

  // Actions - UI
  setSessionUser: (userId: string | null) => void;
  setSelectedCoffee: (id: string | null) => void;
  clearError: () => void;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useCoffeeStore = create<CoffeeStore>()((set, get) => ({
  // Initial state
  sessionUserId: null,
  coffees: [],
  prefetchedCoffeeById: {},
  roasters: [],
  roastersFetchedAt: null,
  roastersUserId: null,
  selectedCoffeeId: null,
  selectedCoffee: null,
  bootstrapCursor: null,
  isLoading: false,
  isLoadingCoffee: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  },

  // ---------------------------------------------------------------------------
  // COFFEE ACTIONS
  // ---------------------------------------------------------------------------

  fetchBootstrap: async (params) => {
    coffeesRequestSeq += 1;
    set({ isLoading: true, error: null });
    const limit = params?.limit ?? DEFAULT_FIRST_PAGE_LIMIT;

    try {
      const response = await bootstrapApi.get({
        limit,
        cursor: params?.cursor,
        includeRoasters: params?.includeRoasters ?? true,
      });

      set((state) => ({
        coffees: response.data.coffees,
        roasters: response.data.roasters ?? state.roasters,
        roastersFetchedAt: response.data.roasters
          ? Date.now()
          : state.roastersFetchedAt,
        roastersUserId: response.data.roasters
          ? state.sessionUserId
          : state.roastersUserId,
        bootstrapCursor: response.page.nextCursor,
        pagination: {
          page: 1,
          limit,
          total: response.data.coffees.length,
          totalPages: 1,
          hasMore: response.page.hasMore,
        },
        isLoading: false,
      }));
    } catch (error) {
      const status =
        error instanceof ApiError
          ? error.status
          : typeof (error as { status?: unknown })?.status === 'number'
            ? ((error as { status: number }).status)
            : null;

      // Backward compatibility: if backend does not have /api/v2/bootstrap yet,
      // fall back to the original /api/v1/coffees flow instead of failing first load.
      if (status === 404) {
        try {
          const fallbackResponse = await coffeeApi.getAll({
            page: 1,
            limit,
          });

          set({
            coffees: fallbackResponse.data,
            bootstrapCursor: null,
            pagination: fallbackResponse.pagination,
            isLoading: false,
            error: null,
          });
          return;
        } catch (fallbackError) {
          set({
            error:
              fallbackError instanceof Error
                ? fallbackError.message
                : 'Failed to fetch coffees',
            isLoading: false,
          });
          return;
        }
      }

      set({
        error: error instanceof Error ? error.message : 'Failed to fetch bootstrap data',
        isLoading: false,
      });
    }
  },

  prefetchCoffeeById: async (id) => {
    if (!id) return;

    const state = get();
    if (state.prefetchedCoffeeById[id]) {
      return;
    }

    const inFlight = prefetchCoffeeRequests.get(id);
    if (inFlight) {
      await inFlight;
      return;
    }

    const request = (async () => {
    try {
      const response = await coffeeApi.getById(id);
      set((currentState) => ({
        prefetchedCoffeeById: {
          ...currentState.prefetchedCoffeeById,
          [id]: response.data,
        },
      }));
    } catch {
      // Ignore prefetch failures to avoid surfacing non-critical background errors.
    }
    })().finally(() => {
      prefetchCoffeeRequests.delete(id);
    });

    prefetchCoffeeRequests.set(id, request);
    await request;
  },

  fetchCoffees: async (params) => {
    const requestSeq = ++coffeesRequestSeq;
    set({ isLoading: true, error: null });
    try {
      const response = await coffeeApi.getAll({
        page: params?.page || 1,
        limit: DEFAULT_FIRST_PAGE_LIMIT,
        search: params?.search,
      });
      if (requestSeq !== coffeesRequestSeq) {
        return;
      }

      set({
        coffees: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      if (requestSeq !== coffeesRequestSeq) {
        return;
      }

      set({
        error: error instanceof Error ? error.message : 'Failed to fetch coffees',
        isLoading: false,
      });
    }
  },

  fetchCoffeeById: async (id) => {
    const currentState = get();
    const hasImmediateContent =
      currentState.selectedCoffeeId === id && currentState.selectedCoffee !== null;
    set({ isLoadingCoffee: !hasImmediateContent, error: null });
    try {
      const response = await coffeeApi.getById(id);
      set((state) => {
        // Ignore stale responses when the user has already navigated elsewhere.
        if (state.selectedCoffeeId !== id) {
          return {
            prefetchedCoffeeById: {
              ...state.prefetchedCoffeeById,
              [id]: response.data,
            },
          };
        }

        return {
          selectedCoffee: response.data,
          selectedCoffeeId: id,
          prefetchedCoffeeById: {
            ...state.prefetchedCoffeeById,
            [id]: response.data,
          },
          isLoadingCoffee: false,
        };
      });
    } catch (error) {
      set((state) => {
        if (state.selectedCoffeeId !== id) {
          return {};
        }

        return {
          error: error instanceof Error ? error.message : 'Failed to fetch coffee',
          isLoadingCoffee: false,
        };
      });
    }
  },

  addCoffee: async (coffee) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coffeeApi.create(coffee);
      const sessionUserId = get().sessionUserId;

      if (sessionUserId) {
        setHotCoffeeId(sessionUserId, response.data.id);
      }

      set((state) => ({
        coffees: [response.data, ...state.coffees],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
          totalPages: Math.max(
            1,
            Math.ceil((state.pagination.total + 1) / state.pagination.limit)
          ),
        },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add coffee',
        isLoading: false,
      });
      return undefined;
    }
  },

  updateCoffee: async (id, updates) => {
    set({ error: null });

    // Optimistic update: apply immediately so UI feels instant
    const prev = get();
    set((state) => ({
      coffees: state.coffees.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      selectedCoffee:
        state.selectedCoffeeId === id && state.selectedCoffee
          ? { ...state.selectedCoffee, ...updates }
          : state.selectedCoffee,
    }));

    try {
      const response = await coffeeApi.update(id, updates);
      // Merge server response; keep cups (update API doesn't return them)
      set((state) => {
        const existingCups = state.selectedCoffee?.cups;
        return {
          coffees: state.coffees.map((c) => (c.id === id ? response.data : c)),
          selectedCoffee:
            state.selectedCoffeeId === id
              ? { ...response.data, cups: existingCups ?? [] }
              : state.selectedCoffee,
        };
      });
    } catch (error) {
      // Revert optimistic update on failure
      set({
        coffees: prev.coffees,
        selectedCoffee: prev.selectedCoffee,
        error: error instanceof Error ? error.message : 'Failed to update coffee',
      });
    }
  },

  deleteCoffee: async (id) => {
    set({ error: null });
    try {
      await coffeeApi.delete(id);
      set((state) => ({
        coffees: state.coffees.filter((c) => c.id !== id),
        selectedCoffeeId: state.selectedCoffeeId === id ? null : state.selectedCoffeeId,
        selectedCoffee: state.selectedCoffeeId === id ? null : state.selectedCoffee,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete coffee',
      });
    }
  },

  // ---------------------------------------------------------------------------
  // CUP ACTIONS
  // ---------------------------------------------------------------------------

  addCup: async (cup) => {
    set({ error: null });
    try {
      const response = await cupApi.create(cup);
      const createdCup: Cup = response.data;

      set((state) => {
        const nextCoffees = state.coffees.map((coffee) =>
          coffee.id === cup.coffeeId
            ? {
                ...coffee,
                _count: { cups: getCoffeeCupCount(coffee) + 1 },
              }
            : coffee
        );

        const selectedCoffee =
          state.selectedCoffeeId === cup.coffeeId && state.selectedCoffee
            ? {
                ...state.selectedCoffee,
                cups: [...(state.selectedCoffee.cups ?? []), createdCup],
                _count: { cups: getCoffeeCupCount(state.selectedCoffee) + 1 },
              }
            : state.selectedCoffee;

        const prefetchedCoffee = state.prefetchedCoffeeById[cup.coffeeId];
        const prefetchedCoffeeById = prefetchedCoffee
          ? {
              ...state.prefetchedCoffeeById,
              [cup.coffeeId]: {
                ...prefetchedCoffee,
                cups: [...(prefetchedCoffee.cups ?? []), createdCup],
                _count: { cups: getCoffeeCupCount(prefetchedCoffee) + 1 },
              },
            }
          : state.prefetchedCoffeeById;

        return {
          coffees: nextCoffees,
          selectedCoffee,
          prefetchedCoffeeById,
        };
      });

      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add cup',
      });
      return undefined;
    }
  },

  updateCup: async (id, updates) => {
    set({ error: null });
    try {
      const response = await cupApi.update(id, updates);
      const updatedCup: Cup = response.data;

      set((state) => {
        if (!state.selectedCoffeeId || !state.selectedCoffee) {
          return {};
        }

        const cups = state.selectedCoffee.cups ?? [];
        const hasCup = cups.some((cup) => cup.id === id);
        if (!hasCup) {
          return {};
        }

        const nextCups = cups.map((cup) => (cup.id === id ? updatedCup : cup));
        const nextSelectedCoffee = {
          ...state.selectedCoffee,
          cups: nextCups,
        };

        const cachedCoffee = state.prefetchedCoffeeById[state.selectedCoffeeId];
        const prefetchedCoffeeById = cachedCoffee
          ? {
              ...state.prefetchedCoffeeById,
              [state.selectedCoffeeId]: {
                ...cachedCoffee,
                cups: (cachedCoffee.cups ?? []).map((cup) =>
                  cup.id === id ? updatedCup : cup
                ),
              },
            }
          : state.prefetchedCoffeeById;

        return {
          selectedCoffee: nextSelectedCoffee,
          prefetchedCoffeeById,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update cup',
      });
    }
  },

  deleteCup: async (id) => {
    set({ error: null });
    try {
      await cupApi.delete(id);

      set((state) => {
        if (!state.selectedCoffeeId || !state.selectedCoffee) {
          return {};
        }

        const currentCups = state.selectedCoffee.cups ?? [];
        const hasCup = currentCups.some((cup) => cup.id === id);
        if (!hasCup) {
          return {};
        }

        const nextCups = currentCups.filter((cup) => cup.id !== id);
        const selectedCoffeeId = state.selectedCoffeeId;

        const coffees = state.coffees.map((coffee) =>
          coffee.id === selectedCoffeeId
            ? {
                ...coffee,
                _count: { cups: Math.max(0, getCoffeeCupCount(coffee) - 1) },
              }
            : coffee
        );

        const selectedCoffee = {
          ...state.selectedCoffee,
          cups: nextCups,
          _count: {
            cups: Math.max(0, getCoffeeCupCount(state.selectedCoffee) - 1),
          },
        };

        const cachedCoffee = state.prefetchedCoffeeById[selectedCoffeeId];
        const prefetchedCoffeeById = cachedCoffee
          ? {
              ...state.prefetchedCoffeeById,
              [selectedCoffeeId]: {
                ...cachedCoffee,
                cups: (cachedCoffee.cups ?? []).filter((cup) => cup.id !== id),
                _count: {
                  cups: Math.max(0, getCoffeeCupCount(cachedCoffee) - 1),
                },
              },
            }
          : state.prefetchedCoffeeById;

        return {
          coffees,
          selectedCoffee,
          prefetchedCoffeeById,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete cup',
      });
    }
  },

  // ---------------------------------------------------------------------------
  // ROASTER ACTIONS
  // ---------------------------------------------------------------------------

  fetchRoasters: async (options) => {
    const { roastersFetchedAt, roastersUserId, sessionUserId } = get();
    if (
      !options?.force &&
      sessionUserId !== null &&
      roastersUserId === sessionUserId &&
      roastersFetchedAt !== null &&
      Date.now() - roastersFetchedAt < ROASTER_CACHE_TTL_MS
    ) {
      return;
    }

    try {
      const response = await roasterApi.getAll();
      set({
        roasters: response.data,
        roastersFetchedAt: Date.now(),
        roastersUserId: get().sessionUserId,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch roasters',
      });
    }
  },

  addRoaster: async (name) => {
    try {
      const response = await roasterApi.create({ name });
      set((state) => ({
        roasters: [...state.roasters, response.data],
        roastersFetchedAt: Date.now(),
        roastersUserId: state.sessionUserId,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add roaster',
      });
      return undefined;
    }
  },

  // ---------------------------------------------------------------------------
  // UI ACTIONS
  // ---------------------------------------------------------------------------

  setSessionUser: (userId) => {
    set((state) => {
      if (state.sessionUserId === userId) {
        return {};
      }

      return {
        sessionUserId: userId,
        coffees: [],
        prefetchedCoffeeById: {},
        roasters: [],
        roastersFetchedAt: null,
        roastersUserId: null,
        selectedCoffeeId: null,
        selectedCoffee: null,
        bootstrapCursor: null,
        error: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    });
  },

  setSelectedCoffee: (id) => {
    if (!id) {
      set({ selectedCoffeeId: null, selectedCoffee: null, isLoadingCoffee: false });
      return;
    }

    const { prefetchedCoffeeById, coffees } = get();
    const prefetchedCoffee = prefetchedCoffeeById[id] ?? null;
    const previewCoffee = coffees.find((coffee) => coffee.id === id) ?? null;

    set({
      selectedCoffeeId: id,
      selectedCoffee: prefetchedCoffee ?? previewCoffee,
      isLoadingCoffee: !prefetchedCoffee && !previewCoffee,
      error: null,
    });

    if (prefetchedCoffee) {
      // Full data (including cups) already in cache — nothing to fetch.
      return;
    }

    // If a prefetch for this coffee is already in-flight, attach to it
    // instead of firing a redundant second network request. This is the common
    // case when the user taps the latest coffee right after the list loads.
    const inFlightPrefetch = prefetchCoffeeRequests.get(id);
    if (inFlightPrefetch) {
      void inFlightPrefetch.then(() => {
        const state = get();
        if (state.selectedCoffeeId !== id) return; // User navigated away
        const freshData = state.prefetchedCoffeeById[id];
        if (freshData) {
          set({ selectedCoffee: freshData, isLoadingCoffee: false });
          return;
        }
        // Prefetch failed silently; fall back to a direct fetch.
        void get().fetchCoffeeById(id);
      });
      return;
    }

    void get().fetchCoffeeById(id);
  },

  clearError: () => set({ error: null }),
}));
