import { StyleSheet } from 'react-native';

import { radii, spacing, typography } from '@/theme/tokens';

const INSIGHT_LINE_HEIGHT = Math.ceil(typography.body.fontSize * 1.35);

export const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  nightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nightTitle: {
    flex: 1,
  },
  nightCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scoreBadgeText: {
    lineHeight: 20,
  },
  roomSection: {
    gap: spacing.sm,
  },
  roomCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
  insight: {
    lineHeight: INSIGHT_LINE_HEIGHT,
  },
});
