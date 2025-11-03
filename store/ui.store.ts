import { create } from "zustand";

interface UIState {
  loading: {
    [key: string]: boolean;
  };
  errors: {
    [key: string]: string | null;
  };

  // Actions
  setLoading: (key: string, status: boolean) => void;
  setError: (key: string, message: string | null) => void;
  clearErrors: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: {},
  errors: {},

  setLoading: (key: string, status: boolean) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: status,
      },
    })),

  setError: (key: string, message: string | null) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [key]: message,
      },
    })),

  clearErrors: () => set({ errors: {} }),
}));
