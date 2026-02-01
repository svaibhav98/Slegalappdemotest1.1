// SunoLegal Design System - Typography
// Consistent text styles

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography = {
  // Display
  displayLarge: {
    fontSize: 32,
    fontWeight: '800' as TextStyle['fontWeight'],
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  
  // Heading
  h1: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  
  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  
  // Label
  label: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
    color: Colors.textMuted,
  },
};
