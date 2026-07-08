import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

import { getSleepNightCellHeight } from '@/features/sleep/ui/sleepNightCellMetrics';

/** Минимальная высота пустой/загружающейся страницы недели */
const WEEK_GRID_EMPTY_MIN_HEIGHT = getSleepNightCellHeight() + spacing.lg;

export const styles = StyleSheet.create({
  page: {
    gap: spacing.sm,
  },
  weekLabel: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loading: {
    minHeight: WEEK_GRID_EMPTY_MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
