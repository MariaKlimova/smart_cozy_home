import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

import { SLEEP_NIGHT_DETAIL_CHART_HEIGHT } from './SleepNightDetail-Skeleton.const';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  insight: {
    height: 18,
    width: '85%',
    borderRadius: radii.sm,
  },
  segmented: {
    height: 40,
    borderRadius: radii.sm,
  },
  chart: {
    height: SLEEP_NIGHT_DETAIL_CHART_HEIGHT,
    borderRadius: radii.sm,
  },
});
