import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface ProviderData {
  profile?: any;
  activities?: any;
  heartRate?: any;
  sleep?: any;
}

interface DailyData {
  [provider: string]: ProviderData;
}

interface ActivityData {
  [date: string]: DailyData;
}

interface ActivityState {
  // Data cache
  activityData: ActivityData;
  lastSync: {
    [provider: string]: string; // ISO date string
  };

  // Actions
  setDailyData: (date: string, provider: string, data: ProviderData) => void;
  updateLastSync: (provider: string) => void;
  clearActivityData: () => void;

  // Loading states
  isSyncing: boolean;
  setSyncing: (status: boolean) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activityData: {},
  lastSync: {},
  isSyncing: false,

  setDailyData: async (date: string, provider: string, data: ProviderData) => {
    const currentData = get().activityData;
    const updatedData = {
      ...currentData,
      [date]: {
        ...(currentData[date] || {}),
        [provider]: {
          ...(currentData[date]?.[provider] || {}),
          ...data,
        },
      },
    };

    // Cache data locally
    await AsyncStorage.setItem(
      "@activity_data_cache",
      JSON.stringify(updatedData)
    );

    set({ activityData: updatedData });
  },

  updateLastSync: async (provider: string) => {
    const currentSync = get().lastSync;
    const now = new Date().toISOString();
    const updatedSync = {
      ...currentSync,
      [provider]: now,
    };

    await AsyncStorage.setItem(
      "@activity_last_sync",
      JSON.stringify(updatedSync)
    );

    set({ lastSync: updatedSync });
  },

  clearActivityData: async () => {
    await AsyncStorage.multiRemove([
      "@activity_data_cache",
      "@activity_last_sync",
    ]);

    set({
      activityData: {},
      lastSync: {},
    });
  },

  setSyncing: (status: boolean) => set({ isSyncing: status }),
}));
