import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors } from './colors';

interface ThemeContextProps {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

const THEME_KEY = '@mindarc_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false); // Default to light mode on first launch

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (e) {
        console.log('Failed to load theme preference');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (e) {
      console.log('Failed to save theme preference');
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
