import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import {
  buildSleepMetricChartPoints,
  buildSleepMetricNormBand,
  buildSleepMetricYDomain,
  buildSleepNightXLabels,
  getSleepMetricUnit,
} from '@/features/sleep/lib/buildSleepMetricChartData';
import { computeMetricNormPercent } from '@/features/sleep/lib/computeMetricNormPercent';
import { formatSleepNightDetailTitle } from '@/features/sleep/lib/formatSleepNightTitle';
import {
  formatSleepNightMetrics,
  sleepScoreLabel,
} from '@/features/sleep/lib/formatSleepNightSummary';
import { sleepScoreTextColor } from '@/features/sleep/lib/sleepScorePresentation';
import { useSleepNightSamples } from '@/features/sleep/lib/useSleepNightSamples';
import { useWearableSleepForNight } from '@/features/sleep/lib/useWearableSleepForNight';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmLineChart } from '@/ui/CalmLineChart';
import { CalmSegmented } from '@/ui/CalmSegmented';
import { typography } from '@/theme/tokens';

import { SleepNightDetailSkeleton } from './-Skeleton';
import { SleepNightDetailSummarySheet } from './-SummarySheet';
import { SleepNightDetailWearable } from './-Wearable';
import {
  SLEEP_NIGHT_DETAIL,
  SLEEP_NIGHT_DETAIL_DETAILS_HIT_SLOP,
  SLEEP_NIGHT_DETAIL_METRIC_OPTIONS,
} from './SleepNightDetail.const';
import type { ISleepNightDetailProps } from './SleepNightDetail.typings';
import { styles } from './SleepNightDetail.styles';

function formatInsight(metricId: TSleepMetricId, percent: number | null): string {
  if (percent === null) {
    return copy.sleep.nightDetailEmpty;
  }

  const template = copy.sleep.metricInsights[metricId];
  return template.replace('{percent}', String(percent));
}

export function SleepNightDetail({ night, weekOffset }: ISleepNightDetailProps) {
  const c = useThemeColors();
  const [activeMetric, setActiveMetric] = useState<TSleepMetricId>('co2');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const { samples, isLoading, isFetching } = useSleepNightSamples({
    nightWindow: night.window,
    weekOffset,
  });

  const isWearableSupported = Platform.OS === 'ios';

  const { wearable, isLoading: isWearableLoading } = useWearableSleepForNight({
    nightWindow: night.window,
    enabled: isWearableSupported,
  });

  const showSkeleton = isLoading || (isFetching && samples.length === 0);

  const metricOptions = useMemo(
    () =>
      SLEEP_NIGHT_DETAIL_METRIC_OPTIONS.map((option) => ({
        id: option.id,
        label: copy.sleep.metricTabs[option.labelKey],
      })),
    [],
  );

  const chartPoints = useMemo(
    () => buildSleepMetricChartPoints(samples, night.window, activeMetric),
    [activeMetric, night.window, samples],
  );

  const yDomain = useMemo(
    () => buildSleepMetricYDomain(chartPoints, activeMetric),
    [activeMetric, chartPoints],
  );

  const xLabels = useMemo(() => buildSleepNightXLabels(night.window), [night.window]);
  const normBand = useMemo(() => buildSleepMetricNormBand(activeMetric), [activeMetric]);
  const insightPercent = useMemo(
    () => computeMetricNormPercent(samples, night.window, activeMetric),
    [activeMetric, night.window, samples],
  );

  const metricItems = useMemo(() => formatSleepNightMetrics(night), [night]);
  const scoreSummary = sleepScoreLabel(night.score);
  const nightTitle = formatSleepNightDetailTitle(night.window.nightDate);
  const hasSummaryDetails = night.issues.length > 0 || metricItems.length > 0;
  const showScoreBadge = night.score !== 'no_data';

  useEffect(() => {
    setIsSummaryOpen(false);
  }, [night.window.nightDate]);

  let loadingContent = (
    <View style={styles.roomSection}>
      <Text style={[typography.subtitle, { color: c.text }]}>
        {copy.sleep.roomConditionsTitle}
      </Text>
      <View style={[styles.roomCard, { backgroundColor: c.surface }]}>
        <SleepNightDetailSkeleton />
      </View>
    </View>
  );

  if (isWearableSupported) {
    loadingContent = (
      <View style={[styles.nightCard, { backgroundColor: c.surface }]}>
        <SleepNightDetailSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container} testID={SLEEP_NIGHT_DETAIL}>
      <View style={styles.nightHeader}>
        <Text style={[typography.subtitle, styles.nightTitle, { color: c.text }]}>{nightTitle}</Text>
        <FontAwesome name="moon-o" size={22} color={c.warning} />
      </View>

      {showSkeleton ? (
        loadingContent
      ) : (
        <>
          {isWearableSupported ? (
            <View style={[styles.nightCard, { backgroundColor: c.surface }]}>
              {showScoreBadge ? (
                <View style={[styles.scoreBadge, { backgroundColor: c.accentMuted }]}>
                  <Text
                    style={[
                      typography.caption,
                      styles.scoreBadgeText,
                      { color: sleepScoreTextColor(night.score, c) },
                    ]}
                  >
                    {scoreSummary}
                  </Text>
                </View>
              ) : null}

              <SleepNightDetailWearable wearable={wearable} isLoading={isWearableLoading} />
            </View>
          ) : null}

          <View style={styles.roomSection}>
            <Text style={[typography.subtitle, { color: c.text }]}>
              {copy.sleep.roomConditionsTitle}
            </Text>

            <View style={[styles.roomCard, { backgroundColor: c.surface }]}>
              <Text style={[typography.body, styles.insight, { color: c.textMuted }]}>
                {formatInsight(activeMetric, insightPercent)}
              </Text>

              <CalmSegmented
                options={metricOptions}
                value={activeMetric}
                onValueChange={(value) => setActiveMetric(value as TSleepMetricId)}
              />

              <CalmLineChart
                points={chartPoints}
                normBand={normBand}
                yDomain={yDomain}
                xLabels={xLabels}
                unit={getSleepMetricUnit(activeMetric)}
                emptyMessage={copy.sleep.nightDetailEmpty}
                embedded
              />

              {hasSummaryDetails ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.sleep.nightSummaryOpenA11y}
                  hitSlop={SLEEP_NIGHT_DETAIL_DETAILS_HIT_SLOP}
                  onPress={() => setIsSummaryOpen(true)}
                  style={({ pressed }) => [
                    styles.detailsButton,
                    pressed ? { opacity: 0.7 } : null,
                  ]}
                >
                  <Text style={[typography.caption, { color: c.accent }]}>
                    {copy.sleep.nightSummaryOpenLabel}
                  </Text>
                  <FontAwesome name="chevron-right" size={12} color={c.accent} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </>
      )}

      <SleepNightDetailSummarySheet
        visible={isSummaryOpen}
        title={nightTitle}
        night={night}
        score={night.score}
        metrics={metricItems}
        onClose={() => setIsSummaryOpen(false)}
      />
    </View>
  );
}
