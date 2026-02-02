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
import { coffeeApi, cupApi, roasterApi } from '../api/client';

// =============================================================================
// STORE STATE
// =============================================================================

interface CoffeeStore {
  // Data
  coffees: Coffee[];
  roasters: Roaster[];
  selectedCoffeeId: string | null;
  selectedCoffee: Coffee | null;

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
  fetchRoasters: () => Promise<void>;
  addRoaster: (name: string) => Promise<Roaster | undefined>;

  // Actions - UI
  setSelectedCoffee: (id: string | null) => void;
  clearError: () => void;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useCoffeeStore = create<CoffeeStore>()((set, get) => ({
  // Initial state
  coffees: [],
  roasters: [],
  selectedCoffeeId: null,
  selectedCoffee: null,
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

  fetchCoffees: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coffeeApi.getAll({
        page: params?.page || 1,
        limit: 20,
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
      set({
        selectedCoffee: response.data,
        selectedCoffeeId: id,
        isLoadingCoffee: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch coffee',
        isLoadingCoffee: false,
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
    try {
      const response = await coffeeApi.update(id, updates);
      set((state) => ({
        coffees: state.coffees.map((c) => (c.id === id ? response.data : c)),
        selectedCoffee:
          state.selectedCoffeeId === id ? response.data : state.selectedCoffee,
      }));
    } catch (error) {
      set({
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

  fetchRoasters: async () => {
    try {
      const response = await roasterApi.getAll();
      set({ roasters: response.data });
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

  setSelectedCoffee: (id) => {
    if (id) {
      get().fetchCoffeeById(id);
    } else {
      set({ selectedCoffeeId: null, selectedCoffee: null });
    }
  },

  clearError: () => set({ error: null }),
}));
