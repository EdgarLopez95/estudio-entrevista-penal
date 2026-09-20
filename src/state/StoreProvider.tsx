import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { ProgressState, ThemePreference } from '@/domain/progress';
import { ProgressStore } from './store';

const StoreContext = createContext<ProgressStore | null>(null);

export function StoreProvider({
  children,
  store,
}: {
  children: ReactNode;
  store?: ProgressStore;
}) {
  const instance = useMemo(() => store ?? new ProgressStore(), [store]);
  return <StoreContext.Provider value={instance}>{children}</StoreContext.Provider>;
}

export function useStore(): ProgressStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore debe usarse dentro de StoreProvider');
  return store;
}

export function useProgress(): ProgressState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/**
 * Tema light/dark/system: por defecto `system`, persistido y nunca improvisado (contrato §18.2).
 */
export function useThemeEffect(): ThemePreference {
  const store = useStore();
  const preference = useProgress().preferences.theme;

  useEffect(() => {
    const root = document.documentElement;
    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const media = supportsMatchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const apply = () => {
      const systemDark = media ? media.matches : false;
      const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    };
    apply();
    if (preference !== 'system' || !media) return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference, store]);

  return preference;
}
