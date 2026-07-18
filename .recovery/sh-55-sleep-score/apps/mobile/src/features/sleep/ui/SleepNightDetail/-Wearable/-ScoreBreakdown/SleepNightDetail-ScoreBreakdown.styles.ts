import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowPressable: {
    minHeight: touchMin,
  },
  label: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    minWidth: 40,
    textAlign: 'right',
  },
  collectingBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
