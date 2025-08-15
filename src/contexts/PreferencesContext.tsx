import React, { createContext, useContext, useEffect, useState } from "react";

export interface Preferences {
  density: "comfortable" | "compact";
  defaultManagerHome: "dashboard" | "team" | "analytics";
  defaultDatePreset: "30d" | "90d" | "ytd" | "12m" | "all";
  showShortcutsTips: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (updates: Partial<Preferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: Preferences = {
  density: "comfortable",
  defaultManagerHome: "dashboard",
  defaultDatePreset: "30d",
  showShortcutsTips: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user-preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn("Failed to load preferences from localStorage:", error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("user-preferences", JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save preferences to localStorage:", error);
    }
  }, [preferences]);

  // Apply density class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("density-comfortable", "density-compact");
    root.classList.add(`density-${preferences.density}`);
  }, [preferences.density]);

  const updatePreferences = (updates: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};