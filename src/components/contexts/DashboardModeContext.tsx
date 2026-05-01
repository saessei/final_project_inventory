import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type DashboardMode = "admin" | "staff";

interface DashboardModeContextType {
  mode: DashboardMode | null;
  setMode: (mode: DashboardMode) => void;
  clearMode: () => void;
}

const STORAGE_KEY = "queuetea.dashboardMode";

const DashboardModeContext = createContext<DashboardModeContextType | undefined>(
  undefined,
);

function readStoredMode(): DashboardMode | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === "admin" || raw === "staff") return raw;
    return null;
  } catch {
    return null;
  }
}

export function DashboardModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DashboardMode | null>(() =>
    readStoredMode(),
  );

  const setMode = (nextMode: DashboardMode) => {
    setModeState(nextMode);
    try {
      sessionStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  };

  const clearMode = () => {
    setModeState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key !== STORAGE_KEY) return;
      setModeState(readStoredMode());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      clearMode,
    }),
    [mode],
  );

  return (
    <DashboardModeContext.Provider value={value}>
      {children}
    </DashboardModeContext.Provider>
  );
}

export function useDashboardMode() {
  const ctx = useContext(DashboardModeContext);
  if (!ctx) {
    throw new Error(
      "useDashboardMode must be used within DashboardModeProvider",
    );
  }
  return ctx;
}
