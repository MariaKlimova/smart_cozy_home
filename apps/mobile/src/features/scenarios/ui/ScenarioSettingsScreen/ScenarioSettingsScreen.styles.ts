import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  description: {
    marginBottom: spacing.lg,
  },
  banner: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  runButton: {
    marginTop: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
