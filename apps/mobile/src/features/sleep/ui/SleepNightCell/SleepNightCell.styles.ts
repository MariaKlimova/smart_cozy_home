import { StyleSheet } from 'react-native';

import { radii } from '@/theme/tokens';

import {
  getSleepNightCellHeight,
  sleepNightCellMetrics,
} from '@/features/sleep/ui/sleepNightCellMetrics';

export const styles = StyleSheet.create({
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
  label: {
    textAlign: 'center',
    lineHeight: sleepNightCellMetrics.labelLineHeight,
  },
  marker: {
    lineHeight: sleepNightCellMetrics.markerLineHeight,
    fontWeight: '600',
  },
});
