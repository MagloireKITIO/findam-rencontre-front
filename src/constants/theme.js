// src/constants/theme.js

import { DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

/**
 * Thème principal de l'application basé sur React Native Paper
 */
export const theme = {
  ...DefaultTheme,
  dark: false,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.card,
    text: colors.text,
    error: colors.error,
    onBackground: colors.text,
    onSurface: colors.text,
    disabled: colors.textLight,
    placeholder: colors.textLight,
    backdrop: colors.overlay,
    notification: colors.secondary,
  },
  fonts: {
    ...DefaultTheme.fonts,
    // On pourrait personnaliser les polices ici si nécessaire
  },
  // Personnalisation supplémentaire pour les composants
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    heading1: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    heading2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 30,
    },
    heading3: {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: 26,
    },
    heading4: {
      fontSize: 18,
      fontWeight: 'bold',
      lineHeight: 24,
    },
    heading5: {
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 22,
    },
    heading6: {
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
};