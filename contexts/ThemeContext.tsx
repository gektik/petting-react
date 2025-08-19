import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Appearance } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    gradient: string[];
    headerGradient: string[];
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gradient: ['#F8FAFC', '#E2E8F0'],
    headerGradient: ['#6366F1', '#8B5CF6'],
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#818CF8',
    secondary: '#A78BFA',
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#475569',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    gradient: ['#0F172A', '#1E293B'],
    headerGradient: ['#4338CA', '#7C3AED'],
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      let savedTheme = null;
      if (Platform.OS === 'web') {
        savedTheme = localStorage.getItem('theme_preference');
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        savedTheme = await AsyncStorage.getItem('theme_preference');
      }

      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Use system preference as default
        const systemTheme = Appearance.getColorScheme();
        setIsDark(systemTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    try {
      const themeValue = newTheme ? 'dark' : 'light';
      if (Platform.OS === 'web') {
        localStorage.setItem('theme_preference', themeValue);
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('theme_preference', themeValue);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}