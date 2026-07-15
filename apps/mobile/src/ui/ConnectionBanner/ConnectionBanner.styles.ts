import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.md,
  },
  message: {
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
