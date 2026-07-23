import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  fieldRow: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    minHeight: touchMin,
  },
});
