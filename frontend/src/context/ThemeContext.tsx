import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark';
export type ResolvedTheme = 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('dark');
  const [resolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0B1020');
    try {
      localStorage.setItem('truthlens_theme', 'dark');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setTheme = () => {
    // Locked to dark mode per requirements
  };

  const toggleTheme = () => {
    // Locked to dark mode per requirements
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
