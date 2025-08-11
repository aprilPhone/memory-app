"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "en" | "es";

interface SettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("memory-app-theme") as Theme;
    const savedLanguage = localStorage.getItem(
      "memory-app-language"
    ) as Language;

    if (savedTheme) {
      setThemeState(savedTheme);
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("memory-app-theme", newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("memory-app-language", newLanguage);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <SettingsContext.Provider
      value={{ theme, language, setTheme, setLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
