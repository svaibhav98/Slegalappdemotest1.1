// SunoLegal Design System - Main Export

export { Colors, Shadows } from './colors';
export { Spacing, Layout } from './spacing';
export { Typography } from './typography';

// Consolidated theme object
export const Theme = {
  colors: require('./colors').Colors,
  spacing: require('./spacing').Spacing,
  layout: require('./spacing').Layout,
  typography: require('./typography').Typography,
  shadows: require('./colors').Shadows,
};
