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
  qualitySection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  qualityBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  qualityValue: {
    lineHeight: 22,
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
  methodology: {
    marginTop: spacing.xs,
  },
  belowNorm: {
    marginTop: spacing.sm,
  },
  normSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  normTrack: {
    height: 10,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  normFill: {
    height: '100%',
    borderRadius: radii.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
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
