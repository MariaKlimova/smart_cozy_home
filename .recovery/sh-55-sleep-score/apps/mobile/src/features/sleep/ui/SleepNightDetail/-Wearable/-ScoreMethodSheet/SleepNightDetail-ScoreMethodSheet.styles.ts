import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const DURATION_SCALE_MIN_MINUTES = 4 * 60;
export const DURATION_SCALE_MAX_MINUTES = 12 * 60;
export const DURATION_NORM_MIN_MINUTES = 7 * 60;
export const DURATION_NORM_MAX_MINUTES = 9 * 60;

export const CONSISTENCY_SCALE_MAX_MINUTES = 90;
export const CONSISTENCY_GOOD_MAX_MINUTES = 15;

/** Запас вокруг реального окна сна на графике, мин */
export const SLEEP_CHART_PADDING_MINUTES = 60;

export const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  scoreBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  scaleBlock: {
    gap: spacing.sm,
  },
  scaleTrack: {
    height: 10,
    borderRadius: radii.sm,
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
  },
  scaleTrackInner: {
    height: 10,
    borderRadius: radii.sm,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  scaleZone: {
    height: '100%',
  },
  scaleMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: -8,
    top: -3,
  },
  scaleLabels: {
    position: 'relative',
    height: 18,
  },
  scaleLabel: {
    position: 'absolute',
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bonusText: {
    flex: 1,
  },
  nightsBlock: {
    gap: spacing.sm,
  },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 28,
  },
  nightDate: {
    width: 52,
  },
  nightTrack: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  nightBar: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 6,
  },
  nightAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 52 + spacing.sm,
  },
});
