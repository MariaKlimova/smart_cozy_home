import { Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IMetricChipProps } from './MetricChip.typings';
import { styles } from './MetricChip.styles';

export function MetricChip({ metric }: IMetricChipProps) {
  const c = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.caption, { color: c.textMuted }]}>{metric.label}</Text>
      <Text style={[typography.subtitle, styles.value, { color: c.text }]}>{metric.value}</Text>
    </View>
  );
}
