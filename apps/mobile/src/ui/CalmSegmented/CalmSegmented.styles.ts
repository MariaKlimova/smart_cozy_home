import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '500',
  },
});
