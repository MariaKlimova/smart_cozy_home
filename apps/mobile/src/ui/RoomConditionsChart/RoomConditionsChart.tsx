import { Text, View } from 'react-native';

import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmLineChart } from '@/ui/CalmLineChart';
import { CalmSegmented } from '@/ui/CalmSegmented';
import { typography } from '@/theme/tokens';

import { RoomConditionsChartSkeleton } from './-Skeleton';
import { useRoomConditionChart } from './RoomConditionsChart.hooks';
import { ROOM_CONDITIONS_CHART, ROOM_CONDITIONS_CHART_METRIC_OPTIONS } from './RoomConditionsChart.const';
import { styles } from './RoomConditionsChart.styles';
import type { IRoomConditionsChartProps } from './RoomConditionsChart.typings';

export function RoomConditionsChart({
  samples,
  range,
  title,
  emptyMessage,
  subtitle,
  insight,
  footer,
  isLoading = false,
  showNormBand = true,
}: IRoomConditionsChartProps) {
  const colors = useThemeColors();
  const {
    activeMetric,
    setActiveMetric,
    chartPoints,
    yDomain,
    xLabels,
    normBand,
    insightText,
    unit,
  } = useRoomConditionChart({
    samples,
    range,
    insight,
    showNormBand,
  });

  return (
    <View style={styles.root} testID={ROOM_CONDITIONS_CHART}>
      <View style={styles.header}>
        <Text style={[typography.subtitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {isLoading ? (
          <RoomConditionsChartSkeleton showInsight={insight !== undefined} />
        ) : (
          <>
            {insightText !== undefined ? (
              <Text style={[typography.body, styles.insight, { color: colors.textMuted }]}>
                {insightText}
              </Text>
            ) : null}

            <CalmSegmented
              options={ROOM_CONDITIONS_CHART_METRIC_OPTIONS}
              value={activeMetric}
              onValueChange={(value) => setActiveMetric(value as TSleepMetricId)}
            />

            <CalmLineChart
              points={chartPoints}
              normBand={normBand}
              yDomain={yDomain}
              xLabels={xLabels}
              unit={unit}
              emptyMessage={emptyMessage}
              embedded
            />

            {footer ?? null}
          </>
        )}
      </View>
    </View>
  );
}
