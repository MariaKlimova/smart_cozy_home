import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { styles } from './BedroomStateCard-Metrics.styles';
import type { IBedroomStateCardMetricsProps } from './BedroomStateCard-Metrics.typings';

function MetricValue({ metric }: { metric: IBedroomStateCardMetricsProps['metrics'][number] }) {
  const c = useThemeColors();
  const hasNumber = metric.value !== copy.now.metricsUnavailable;

  if (!hasNumber) {
    return <Text style={[styles.value, { color: c.textMuted }]}>{metric.value}</Text>;
  }

  if (metric.showPpmUnit) {
    return (
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.text }]}>{metric.value}</Text>
        <Text style={[styles.unit, { color: c.textMuted }]}>{copy.now.metrics.ppmUnit}</Text>
      </View>
    );
  }

  return <Text style={[styles.value, { color: c.text }]}>{metric.value}</Text>;
}

export function BedroomStateCardMetrics({
  sectionTitle,
  metrics,
}: IBedroomStateCardMetricsProps) {
  const c = useThemeColors();

  return (
    <View style={styles.section}>
      {sectionTitle ? (
        <Text style={[typography.caption, styles.sectionTitle, { color: c.textMuted }]}>
          {sectionTitle}
        </Text>
      ) : null}
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
    </View>
  );
}
