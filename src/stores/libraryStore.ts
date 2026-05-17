import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LibraryState {
  installed: boolean;
  installPath: string | null;
  icon: string | null;
  setInstalled: (path: string, icon: string | null) => void;
  uninstall: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      installed: false,
      installPath: null,
      icon: null,
      setInstalled: (path, icon) => set({ installed: true, installPath: path, icon }),
      uninstall: () => set({ installed: false, installPath: null, icon: null }),
    }),
    { name: "arc-library" }
  )
);
