import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  statValue: {
    lineHeight: 24,
  },
  nightScoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  nightScoreValue: {
    flexShrink: 0,
  },
  breakdownSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  breakdownTitle: {
    letterSpacing: 0.4,
  },
  belowNormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  belowNormText: {
    flex: 1,
  },
  trendSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trendBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  emptySection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    minHeight: touchMin,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
});
