import { StyleSheet } from 'react-native';

import { radii, spacing, typography } from '@/theme/tokens';

const INSIGHT_LINE_HEIGHT = Math.ceil(typography.body.fontSize * 1.35);

export const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  headerSection: {
    gap: spacing.xs,
  },
  contentSection: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreSummary: {
    flex: 1,
    lineHeight: INSIGHT_LINE_HEIGHT,
    fontStyle: 'italic',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
  insight: {
    lineHeight: INSIGHT_LINE_HEIGHT,
  },
});
