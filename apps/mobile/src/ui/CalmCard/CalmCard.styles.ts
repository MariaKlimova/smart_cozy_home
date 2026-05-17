import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const paddingStyles = StyleSheet.create({
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
});

export const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: 'transparent',
  },
});
