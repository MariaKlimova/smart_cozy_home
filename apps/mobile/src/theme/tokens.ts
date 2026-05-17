export const colors = {
  light: {
    background: '#F7F3EE',
    surface: '#FFFFFF',
    text: '#2C2825',
    textMuted: '#6B6560',
    accent: '#C4785A',
    accentMuted: '#E8D5CC',
    border: '#E5DFD8',
    success: '#7A9E7E',
    warning: '#C4A35A',
  },
  dark: {
    background: '#1E1C1A',
    surface: '#2A2724',
    text: '#F0EBE6',
    textMuted: '#A39E98',
    accent: '#D4927A',
    accentMuted: '#4A3F3A',
    border: '#3D3834',
    success: '#8FB393',
    warning: '#D4B86A',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const touchMin = 48;

export const typography = {
  title: { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 17, fontWeight: '500' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
};
