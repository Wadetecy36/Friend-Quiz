import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DesignSystemId,
  DesignSystemMeta,
  DESIGN_SYSTEMS,
  DEFAULT_DESIGN_SYSTEM_ID,
  getDesignSystem,
  applyDesignSystemToDocument,
} from '../lib/designSystems';

interface DesignSystemContextValue {
  theme: DesignSystemMeta;
  themeId: DesignSystemId;
  setThemeId: (id: DesignSystemId) => void;
  availableThemes: DesignSystemMeta[];
  isExplorerOpen: boolean;
  openExplorer: () => void;
  closeExplorer: () => void;
}

const STORAGE_KEY = 'quiz_active_design_system_v5_lava';

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<DesignSystemId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as DesignSystemId | null;
      if (saved && DESIGN_SYSTEMS.some((ds) => ds.id === saved)) {
        return saved;
      }
    }
    return DEFAULT_DESIGN_SYSTEM_ID;
  });

  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const theme = getDesignSystem(themeId);

  useEffect(() => {
    applyDesignSystemToDocument(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeId);
    }
  }, [theme, themeId]);

  const setThemeId = (id: DesignSystemId) => {
    setThemeIdState(id);
  };

  const openExplorer = () => setIsExplorerOpen(true);
  const closeExplorer = () => setIsExplorerOpen(false);

  return (
    <DesignSystemContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        availableThemes: DESIGN_SYSTEMS,
        isExplorerOpen,
        openExplorer,
        closeExplorer,
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = (): DesignSystemContextValue => {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return ctx;
};
