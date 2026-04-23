import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

export const useTheme = () => {
  return useContext(ThemeContext);
};
