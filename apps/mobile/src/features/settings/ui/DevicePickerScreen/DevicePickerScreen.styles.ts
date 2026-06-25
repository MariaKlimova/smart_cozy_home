import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  sectionHeader: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    padding: spacing.lg,
    textAlign: 'center',
  },
});
