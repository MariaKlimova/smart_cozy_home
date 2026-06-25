import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IBedroomStateCardMetricsProps } from './BedroomStateCard-Metrics.typings';
import { styles } from './BedroomStateCard-Metrics.styles';

function MetricValue({ metric }: { metric: IBedroomStateCardMetricsProps['metrics'][number] }) {
  const c = useThemeColors();
  const isCo2 = metric.id === 'co2';
  const hasNumber = metric.value !== copy.now.metricsUnavailable;

  if (!hasNumber) {
    return <Text style={[styles.value, { color: c.textMuted }]}>{metric.value}</Text>;
  }

  if (isCo2) {
    return (
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.text }]}>{metric.value}</Text>
        <Text style={[styles.unit, { color: c.textMuted }]}>ppm</Text>
      </View>
    );
  }

  return <Text style={[styles.value, { color: c.text }]}>{metric.value}</Text>;
}

export function BedroomStateCardMetrics({ metrics }: IBedroomStateCardMetricsProps) {
  const c = useThemeColors();

  return (
    <View style={styles.row}>
      {metrics.map((metric) => (
        <View
          key={metric.id}
          style={[styles.chip, { backgroundColor: c.background, borderColor: c.border }]}
        >
          <Text style={styles.icon}>{metric.icon}</Text>
          <MetricValue metric={metric} />
          <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>
            {metric.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
