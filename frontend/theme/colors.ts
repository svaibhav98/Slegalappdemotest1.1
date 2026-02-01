// SunoLegal Design System - Colors
// Professional, consistent color palette

export const Colors = {
  // Brand Colors
  primary: '#FF9933',      // Orange - primary actions, highlights
  primaryLight: '#FFB366', // Lighter orange
  primaryDark: '#E68A00',  // Darker orange
  
  secondary: '#059669',    // Green - success, secondary actions
  secondaryLight: '#10B981',
  secondaryDark: '#047857',
  
  // Neutral Colors
  background: '#F8F9FA',   // Main background
  surface: '#FFFFFF',      // Cards, elevated surfaces
  surfaceAlt: '#F3F4F6',   // Alternative surface
  
  // Text Colors
  textPrimary: '#1A1A2E',  // Main text
  textSecondary: '#6B7280', // Secondary text
  textMuted: '#9CA3AF',     // Muted/disabled text
  textInverse: '#FFFFFF',   // Text on dark backgrounds
  
  // Border & Divider
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gradients
  gradientStart: '#FAFAFA',
  gradientEnd: '#F3F4F6',
  
  // Header/Navigation
  headerBg: '#2B2D42',
  headerText: '#FFFFFF',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Shadow presets
export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
