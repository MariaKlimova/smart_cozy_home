import { StyleSheet, Text, View } from 'react-native';

import type { IMetricChipProps } from '@/ui/MetricChip/MetricChip.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

export function MetricChip({ metric }: IMetricChipProps) {
  const c = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.caption, { color: c.textMuted }]}>{metric.label}</Text>
      <Text style={[typography.subtitle, { color: c.text, marginTop: 4 }]}>{metric.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
});
