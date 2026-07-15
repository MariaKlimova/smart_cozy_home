import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { styles } from './BedroomStateCard-Metrics.styles';
import type { IBedroomStateCardMetricsProps } from './BedroomStateCard-Metrics.typings';

function chunkMetrics<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function MetricValue({ metric }: { metric: IBedroomStateCardMetricsProps['metrics'][number] }) {
  const c = useThemeColors();
  const hasNumber = metric.value !== copy.now.metricsUnavailable;

  if (!hasNumber) {
    return <Text style={[styles.value, { color: c.textMuted }]}>{metric.value}</Text>;
  }

  let unitLabel: string | undefined;
  if (metric.showPpmUnit) {
    unitLabel = copy.now.metrics.ppmUnit;
  } else if (metric.showMmhgUnit) {
    unitLabel = copy.now.metrics.mmhgUnit;
  }

  if (unitLabel) {
    return (
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.text }]}>{metric.value}</Text>
        <Text style={[styles.unit, { color: c.textMuted }]}>{unitLabel}</Text>
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
  const rows = chunkMetrics(metrics, 2);

  return (
    <View style={styles.section}>
      {sectionTitle ? (
        <Text style={[typography.caption, styles.sectionTitle, { color: c.textMuted }]}>
          {sectionTitle}
        </Text>
      ) : null}
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((metric) => (
            <View
              key={metric.id}
              style={[styles.chip, { backgroundColor: c.background, borderColor: c.border }]}
            >
              <Text style={styles.icon}>{metric.icon}</Text>
              <MetricValue metric={metric} />
              <Text
                style={[typography.caption, styles.label, { color: c.textMuted }]}
                numberOfLines={1}
              >
                {metric.label}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
