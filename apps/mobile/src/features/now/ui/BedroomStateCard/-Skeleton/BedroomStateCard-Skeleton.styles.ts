import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  titleBar: {
    borderRadius: 8,
    height: 32,
    width: '78%',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricChip: {
    flex: 1,
    height: 88,
    borderRadius: radii.sm,
  },
});
