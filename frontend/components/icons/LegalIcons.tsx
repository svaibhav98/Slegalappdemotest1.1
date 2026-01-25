import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

// Color constants
const COLORS = {
  primary: '#FF9933',
  primaryDark: '#E68A00',
  secondary: '#059669',
  secondaryLight: '#10B981',
  charcoal: '#2B2D42',
  gray: '#6B7280',
};

interface IconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

// NyayAI Icon - Clean Professional Legal-AI Icon (Scales + AI Brain)
// Using 24x24 viewBox to match other icons for consistent sizing
export const NyayAIIcon = ({ size = 24, color = COLORS.primary, secondaryColor = COLORS.secondary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer circle */}
    <Circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth="1.2" fill="none" />
    {/* Inner fill */}
    <Circle cx="12" cy="12" r="9.5" fill={color} opacity="0.08" />
    {/* Scales pillar */}
    <Path
      d="M12 5v14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Balance beam */}
    <Path
      d="M6 9h12"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Left scale */}
    <Path
      d="M6 9l-1 4h4l-1-4"
      stroke={secondaryColor}
      strokeWidth="1"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right scale */}
    <Path
      d="M18 9l-1 4h4l-1-4"
      stroke={secondaryColor}
      strokeWidth="1"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Center node */}
    <Circle cx="12" cy="7" r="1.5" fill={color} />
    {/* Base */}
    <Path
      d="M10 17h4"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </Svg>
);
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Scales of Justice Icon - Professional legal icon
export const ScalesIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Center pillar */}
    <Path
      d="M12 3v18M12 21H8M12 21h4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Balance beam */}
    <Path
      d="M4 8h16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Left scale pan */}
    <Path
      d="M4 8l-1 6h6l-1-6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right scale pan */}
    <Path
      d="M20 8l-1 6h6l-1-6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Top ornament */}
    <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);

// Gavel Icon - Professional legal judgment icon
export const GavelIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Gavel head */}
    <Rect
      x="2"
      y="4"
      width="8"
      height="5"
      rx="1"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
      transform="rotate(-45 6 6.5)"
    />
    {/* Handle */}
    <Path
      d="M10 10l8 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Sound block */}
    <Path
      d="M15 19h6v2h-6z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

// Legal Document Icon - Professional document with seal
export const LegalDocumentIcon = ({ size = 28, color = COLORS.primary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Document body */}
    <Path
      d="M6 2h8l6 6v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    {/* Folded corner */}
    <Path
      d="M14 2v6h6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Text lines */}
    <Path
      d="M8 12h8M8 16h5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Seal circle */}
    <Circle cx="15" cy="18" r="2.5" stroke={color} strokeWidth="1.2" fill="none" />
  </Svg>
);

// Law Book Icon - Professional legal reference
export const LawBookIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Book cover */}
    <Path
      d="M4 4h12a2 2 0 012 2v14a2 2 0 01-2 2H4V4z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    {/* Book spine */}
    <Path
      d="M4 4v18"
      stroke={color}
      strokeWidth="2.5"
    />
    {/* Pages */}
    <Path
      d="M7 8h6M7 12h6M7 16h4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Bookmark ribbon */}
    <Path
      d="M14 2v6l-1.5-1.5L11 8V2"
      stroke={COLORS.primary}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

// Briefcase Icon - Professional case management
export const BriefcaseIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Case body */}
    <Rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    {/* Handle */}
    <Path
      d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Center clasp */}
    <Path
      d="M12 11v4M10 13h4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Divider line */}
    <Path
      d="M2 13h20"
      stroke={color}
      strokeWidth="1"
      opacity="0.4"
    />
  </Svg>
);

// Consultation/Lawyer Icon - Professional legal counsel
export const ConsultationIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Head */}
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none" />
    {/* Body/robe */}
    <Path
      d="M5 21v-2a7 7 0 0114 0v2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Collar/tie detail */}
    <Path
      d="M12 11v3M10 14l2 2 2-2"
      stroke={COLORS.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Government/Scheme Icon - Building/Institution
export const GovernmentIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Roof/pediment */}
    <Path
      d="M3 10l9-6 9 6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Base */}
    <Path
      d="M4 10v10h16V10"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Columns */}
    <Path
      d="M8 10v10M12 10v10M16 10v10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Foundation */}
    <Path
      d="M2 20h20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Shield/Verification Icon - Trust indicator
export const ShieldVerifyIcon = ({ size = 28, color = COLORS.secondary }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    {/* Checkmark */}
    <Path
      d="M8 12l3 3 5-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bookmark Icon - Saved items
export const BookmarkIcon = ({ size = 28, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4a2 2 0 012-2h10a2 2 0 012 2v18l-7-4-7 4V4z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    {/* Inner line */}
    <Path
      d="M9 7h6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

// Home Icon
export const HomeIcon = ({ size = 24, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12l9-9 9 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Folder/Cases Icon
export const FolderIcon = ({ size = 24, color = COLORS.charcoal }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    <Path
      d="M3 10h18"
      stroke={color}
      strokeWidth="1"
      opacity="0.5"
    />
  </Svg>
);

export default {
  NyayAIIcon,
  ScalesIcon,
  GavelIcon,
  LegalDocumentIcon,
  LawBookIcon,
  BriefcaseIcon,
  ConsultationIcon,
  GovernmentIcon,
  ShieldVerifyIcon,
  BookmarkIcon,
  HomeIcon,
  FolderIcon,
};
