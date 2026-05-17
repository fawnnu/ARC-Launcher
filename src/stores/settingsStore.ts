import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en-GB" | "de";

interface SettingsState {
  locale: Locale;
  animatedBg: boolean;
  setLocale: (locale: Locale) => void;
  setAnimatedBg: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: "en-GB",
      animatedBg: true,
      setLocale: (locale) => set({ locale }),
      setAnimatedBg: (animatedBg) => set({ animatedBg }),
    }),
    { name: "arc-settings" }
  )
);
