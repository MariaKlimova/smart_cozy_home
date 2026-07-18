import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

import { NIGHT_DATE_COLUMN_WIDTH } from './SleepNightDetail-ScoreMethodSheet.const';

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
  headerTitle: {
    flexShrink: 1,
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
    borderRadius: radii.xs,
    borderWidth: 2,
    marginLeft: -radii.xs,
    top: -3,
  },
  scaleLabels: {
    position: 'relative',
    height: 18,
  },
  scaleLabel: {
    position: 'absolute',
  },
  scaleLabelsEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 18,
  },
  scaleThresholdRow: {
    position: 'relative',
    minHeight: 18,
  },
  scaleThresholdLabel: {
    position: 'absolute',
    top: 0,
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
    width: NIGHT_DATE_COLUMN_WIDTH,
  },
  nightTrack: {
    flex: 1,
    height: 16,
    borderRadius: radii.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  nightBar: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: radii.xxs,
  },
  nightAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: NIGHT_DATE_COLUMN_WIDTH + spacing.sm,
  },
});
