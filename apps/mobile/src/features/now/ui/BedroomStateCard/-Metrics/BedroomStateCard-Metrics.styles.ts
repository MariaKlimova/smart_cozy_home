import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  icon: {
    fontSize: 22,
    lineHeight: 26,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    marginTop: 2,
    textAlign: 'center',
  },
});
