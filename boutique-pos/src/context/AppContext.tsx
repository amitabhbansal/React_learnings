import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AppContextType {
  privacyMode: boolean;
  togglePrivacyMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('privacyMode');
    return saved === 'true';
  });

  useEffect(() => {
    // Persist to localStorage whenever privacyMode changes
    localStorage.setItem('privacyMode', privacyMode.toString());
  }, [privacyMode]);

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => !prev);
  };

  return (
    <AppContext.Provider value={{ privacyMode, togglePrivacyMode }}>{children}</AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
