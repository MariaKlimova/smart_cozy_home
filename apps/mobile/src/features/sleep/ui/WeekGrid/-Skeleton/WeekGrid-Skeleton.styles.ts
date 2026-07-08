import { StyleSheet } from 'react-native';

import { radii } from '@/theme/tokens';

import {
  getSleepNightCellHeight,
  sleepNightCellMetrics,
} from '@/features/sleep/ui/sleepNightCellMetrics';

export const styles = StyleSheet.create({
  page: {
    gap: sleepNightCellMetrics.gap,
  },
  weekLabel: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: sleepNightCellMetrics.gap,
  },
  cell: {
    flex: 1,
    height: getSleepNightCellHeight(),
    minHeight: sleepNightCellMetrics.minHeight,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sleepNightCellMetrics.paddingVertical,
    paddingHorizontal: sleepNightCellMetrics.paddingHorizontal,
    gap: sleepNightCellMetrics.gap,
  },
  marker: {
    width: sleepNightCellMetrics.markerWidth,
    height: sleepNightCellMetrics.markerLineHeight,
    borderRadius: sleepNightCellMetrics.markerWidth / 2,
  },
  label: {
    width: sleepNightCellMetrics.labelWidth,
    height: sleepNightCellMetrics.labelLineHeight,
    borderRadius: radii.sm,
  },
});
