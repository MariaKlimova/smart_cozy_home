import { StyleSheet } from 'react-native';

import { radii, spacing, typography } from '@/theme/tokens';

const INSIGHT_LINE_HEIGHT = Math.ceil(typography.body.fontSize * 1.35);

export const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  insight: {
    lineHeight: INSIGHT_LINE_HEIGHT,
  },
});
