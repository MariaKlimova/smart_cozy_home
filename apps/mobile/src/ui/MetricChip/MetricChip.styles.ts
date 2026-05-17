import { StyleSheet } from 'react-native';

import { METRIC_CHIP_MIN_WIDTH } from './MetricChip.const';
import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minWidth: METRIC_CHIP_MIN_WIDTH,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  value: {
    marginTop: 4,
  },
});
