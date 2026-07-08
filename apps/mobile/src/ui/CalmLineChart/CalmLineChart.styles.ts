import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

import { CALM_LINE_CHART_DEFAULT_HEIGHT } from './CalmLineChart.const';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartCard: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: CALM_LINE_CHART_DEFAULT_HEIGHT,
  },
});
