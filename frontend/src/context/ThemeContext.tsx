import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light';
export type ResolvedTheme = 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('light');
  const [resolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#714B67');
    try {
      localStorage.setItem('truthlens_theme', 'light');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setTheme = () => {
    // Locked to light mode per Odoo design specification
  };

  const toggleTheme = () => {
    // Locked to light mode per Odoo design specification
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
