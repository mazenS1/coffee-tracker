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

const ROASTER_CACHE_TTL_MS = 300_000;
const DEFAULT_FIRST_PAGE_LIMIT = 20;

// =============================================================================
// STORE STATE
// =============================================================================

interface CoffeeStore {
  // Data
  sessionUserId: string | null;
  coffees: Coffee[];
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
    set({ isLoading: true, error: null });
    const limit = params?.limit ?? DEFAULT_FIRST_PAGE_LIMIT;

    try {
      const response = await bootstrapApi.get({
        limit,
        cursor: params?.cursor,
        includeRoasters: params?.includeRoasters ?? false,
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

  fetchCoffees: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coffeeApi.getAll({
        page: params?.page || 1,
        limit: DEFAULT_FIRST_PAGE_LIMIT,
        search: params?.search,
      });
      set({
        coffees: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch coffees',
        isLoading: false,
      });
    }
  },

  fetchCoffeeById: async (id) => {
    set({ isLoadingCoffee: true, error: null });
    try {
      const response = await coffeeApi.getById(id);
      set((state) => {
        // Ignore stale responses when the user has already navigated elsewhere.
        if (state.selectedCoffeeId !== id) {
          return {};
        }

        return {
          selectedCoffee: response.data,
          selectedCoffeeId: id,
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
      set((state) => ({
        coffees: [response.data, ...state.coffees],
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
      // Refresh the selected coffee to get updated cups
      const { selectedCoffeeId } = get();
      if (selectedCoffeeId === cup.coffeeId) {
        await get().fetchCoffeeById(selectedCoffeeId);
      }
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
      await cupApi.update(id, updates);
      // Refresh the selected coffee to get updated cups
      const { selectedCoffeeId } = get();
      if (selectedCoffeeId) {
        await get().fetchCoffeeById(selectedCoffeeId);
      }
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
      // Refresh the selected coffee to get updated cups
      const { selectedCoffeeId } = get();
      if (selectedCoffeeId) {
        await get().fetchCoffeeById(selectedCoffeeId);
      }
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
    if (id) {
      const previewCoffee = get().coffees.find((coffee) => coffee.id === id) ?? null;
      set({
        selectedCoffeeId: id,
        selectedCoffee: previewCoffee,
        isLoadingCoffee: true,
        error: null,
      });
      void get().fetchCoffeeById(id);
    } else {
      set({ selectedCoffeeId: null, selectedCoffee: null, isLoadingCoffee: false });
    }
  },

  clearError: () => set({ error: null }),
}));
