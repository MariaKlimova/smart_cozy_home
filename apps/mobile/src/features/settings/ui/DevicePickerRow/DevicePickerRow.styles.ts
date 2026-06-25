import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    minHeight: touchMin,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
