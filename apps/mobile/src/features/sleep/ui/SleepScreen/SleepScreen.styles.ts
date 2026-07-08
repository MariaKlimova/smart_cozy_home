import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

import { sleepNightCellMetrics } from '@/features/sleep/ui/sleepNightCellMetrics';
import { SLEEP_SCREEN_HORIZONTAL_PADDING } from './SleepScreen.const';

export const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  legend: {
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: sleepNightCellMetrics.markerWidth,
    height: sleepNightCellMetrics.markerWidth,
    borderRadius: radii.sm,
  },
  pager: {
    marginHorizontal: -SLEEP_SCREEN_HORIZONTAL_PADDING,
  },
  weekPage: {
    flexShrink: 0,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  weekNavButton: {
    minWidth: touchMin,
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  weekNavButtonDisabled: {
    opacity: 0.35,
  },
  hint: {
    textAlign: 'center',
  },
  hintBlock: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
});
