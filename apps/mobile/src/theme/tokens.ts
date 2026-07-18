export const colors = {
  light: {
    background: '#F7F3EE',
    surface: '#FFFFFF',
    text: '#2C2825',
    textMuted: '#6B6560',
    accent: '#C4785A',
    accentMuted: '#E8D5CC',
    onAccent: '#FFFFFF',
    border: '#E5DFD8',
    success: '#7A9E7E',
    successMuted: '#DCE8DD',
    warning: '#C4A35A',
    warningMuted: '#F0E8D4',
    danger: '#B87070',
    dangerMuted: '#EDE0E0',
  },
  dark: {
    background: '#1E1C1A',
    surface: '#2A2724',
    text: '#F0EBE6',
    textMuted: '#A39E98',
    accent: '#D4927A',
    accentMuted: '#4A3F3A',
    onAccent: '#FFFFFF',
    border: '#3D3834',
    success: '#8FB393',
    successMuted: '#2F3A30',
    warning: '#D4B86A',
    warningMuted: '#3A3528',
    danger: '#C88484',
    dangerMuted: '#3A2E2E',
  },
} as const;

export const overlay = {
  scrim: 'rgba(0, 0, 0, 0.35)',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  xxs: 6,
  xs: 8,
  sm: 14,
  md: 16,
} as const;

export const touchMin = 48;

export const typography = {
  title: { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 17, fontWeight: '500' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
};
