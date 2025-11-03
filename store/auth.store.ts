import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthState {
  // Auth tokens
  googleToken: string | null;
  providerTokens: {
    fitbit?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  };

  // Actions
  setGoogleToken: (token: string | null) => void;
  setProviderToken: (provider: string, tokens: any) => void;
  clearAuth: () => void;

  // Provider connection status
  connectedProviders: string[];
  setProviderConnected: (provider: string, isConnected: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  googleToken: null,
  providerTokens: {},
  connectedProviders: [],

  setGoogleToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem("@auth_google_token", token);
    } else {
      await AsyncStorage.removeItem("@auth_google_token");
    }
    set({ googleToken: token });
  },

  setProviderToken: async (provider, tokens) => {
    const currentTokens = get().providerTokens;
    const updatedTokens = {
      ...currentTokens,
      [provider]: tokens,
    };

    // Simpan token provider di AsyncStorage
    await AsyncStorage.setItem(
      `@auth_${provider}_tokens`,
      JSON.stringify(tokens)
    );

    set({ providerTokens: updatedTokens });
  },

  clearAuth: async () => {
    // Delete all token
    await AsyncStorage.multiRemove([
      "@auth_google_token",
      ...get().connectedProviders.map((p) => `@auth_${p}_tokens`),
    ]);

    set({
      googleToken: null,
      providerTokens: {},
      connectedProviders: [],
    });
  },

  setProviderConnected: (provider, isConnected) => {
    const current = get().connectedProviders;
    const updated = isConnected
      ? [...current, provider]
      : current.filter((p) => p !== provider);

    set({ connectedProviders: updated });
  },
}));
