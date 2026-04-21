export const colors = {
  blue50: "#eef4ff",
  blue100: "#dce8ff",
  blue300: "#85adff",
  blue500: "#2f63ea",
  blue600: "#1f4dcc",
  blue700: "#1a3ea6",
  blue900: "#0f2258",
  orange50: "#fff4ec",
  orange100: "#ffe3d0",
  orange300: "#ffa069",
  orange400: "#fb7f3a",
  orange500: "#e6671e",
  orange700: "#9a3e0d",
  gray0: "#ffffff",
  gray25: "#fbfcfd",
  gray50: "#f5f7fa",
  gray100: "#eef1f6",
  gray200: "#e2e7ef",
  gray300: "#cbd3df",
  gray400: "#9aa4b4",
  gray500: "#6b7588",
  gray600: "#4a5468",
  gray700: "#323a4b",
  gray800: "#1f2533",
  gray900: "#0f131d",
  success: "#18a673",
  warning: "#e0a318",
  danger: "#dc3848",
  primary: "#2f63ea",
  primaryDark: "#1f4dcc",
  primarySoft: "#eef4ff",
  green: "#18a673",
  greenSoft: "#e6f6ef",
  orange: "#e6671e",
  orangeSoft: "#fff4ec",
  yellow: "#e0a318",
  yellowSoft: "#fff8e3",
  purple: "#8a94a6",
  purpleSoft: "#f5f7fa",
  voteYes: "#18a673",
  voteNo: "#dc3848",
  voteNeutral: "#8a94a6",
  text: "#0f131d",
  muted: "#6b7588",
  subtle: "#9aa4b4",
  border: "#e2e7ef",
  borderStrong: "#cbd3df",
  background: "#f5f7fa",
  backgroundAlt: "#eef1f6",
  surface: "#ffffff",
  surfaceMuted: "#eef1f6",
  surfaceSunken: "#eef1f6",
  dangerSoft: "#fdeaec"
};

export const cardColors = [
  colors.orange400,
  colors.orange500,
  colors.blue500,
  colors.green,
  colors.gray600
];

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999
};

export const typography = {
  display: 36,
  h1: 28,
  title: 22,
  subtitle: 18,
  body: 14,
  small: 13,
  tiny: 12,
  micro: 11
};

export const fontFamilies = {
  sans: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif",
  display: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
};

export const fontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "900" as const
};

export const shadows = {
  xs: {
    boxShadow: "0 1px 2px rgba(15, 19, 29, 0.04)",
    elevation: 1
  },
  sm: {
    boxShadow: "0 2px 8px rgba(15, 19, 29, 0.06)",
    elevation: 2
  },
  md: {
    boxShadow: "0 8px 18px rgba(15, 19, 29, 0.1)",
    elevation: 4
  },
  lg: {
    boxShadow: "0 14px 28px rgba(15, 19, 29, 0.14)",
    elevation: 8
  }
};
