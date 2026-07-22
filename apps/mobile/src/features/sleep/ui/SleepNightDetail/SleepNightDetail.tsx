import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import { computeMetricNormPercent } from '@/features/sleep/lib/computeMetricNormPercent';
import { formatSleepNightDetailTitle } from '@/features/sleep/lib/formatSleepNightTitle';
import {
  formatSleepNightMetrics,
  sleepScoreLabel,
} from '@/features/sleep/lib/formatSleepNightSummary';
import { sleepScoreTextColor } from '@/features/sleep/lib/sleepScorePresentation';
import { useSleepNightSamples } from '@/features/sleep/lib/useSleepNightSamples';
import { useWearableSleepScore } from '@/features/sleep/lib/useWearableSleepScore';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { TSleepScoreTrendDays } from '@/health/sleepScore.typings';
import { RoomConditionsChart } from '@/ui/RoomConditionsChart';
import { typography } from '@/theme/tokens';

import { SleepNightDetailSkeleton } from './-Skeleton';
import { SleepNightDetailSummarySheet } from './-SummarySheet';
import { SleepNightDetailWearable } from './-Wearable';
import {
  SLEEP_NIGHT_DETAIL,
  SLEEP_NIGHT_DETAIL_DETAILS_HIT_SLOP,
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
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [trendDays, setTrendDays] = useState<TSleepScoreTrendDays>(7);

  const { samples, isLoading, isFetching } = useSleepNightSamples({
    nightWindow: night.window,
    weekOffset,
  });

  const isWearableSupported = Platform.OS === 'ios';

  const {
    status: wearableStatus,
    selectedSummary,
    selectedNightScore,
    methodDetails,
    trend,
    isLoading: isWearableLoading,
  } = useWearableSleepScore({
    selectedNightDate: night.window.nightDate,
    trendDays,
    enabled: isWearableSupported,
  });

  const showSkeleton = isLoading || (isFetching && samples.length === 0);

  const metricItems = useMemo(() => formatSleepNightMetrics(night), [night]);
  const scoreSummary = sleepScoreLabel(night.score);
  const nightTitle = formatSleepNightDetailTitle(night.window.nightDate);
  const hasSummaryDetails = night.issues.length > 0 || metricItems.length > 0;
  const showScoreBadge = night.score !== 'no_data';

  const roomRange = useMemo(
    () => ({ startAt: night.window.startAt, endAt: night.window.endAt }),
    [night.window.endAt, night.window.startAt],
  );

  const resolveInsight = useMemo(
    () => (metricId: TSleepMetricId) => {
      const percent = computeMetricNormPercent(samples, night.window, metricId);
      return formatInsight(metricId, percent);
    },
    [night.window, samples],
  );

  useEffect(() => {
    setIsSummaryOpen(false);
  }, [night.window.nightDate]);

  let detailsFooter = null;
  if (hasSummaryDetails) {
    detailsFooter = (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.sleep.nightSummaryOpenA11y}
        hitSlop={SLEEP_NIGHT_DETAIL_DETAILS_HIT_SLOP}
        onPress={() => setIsSummaryOpen(true)}
        style={({ pressed }) => [styles.detailsButton, pressed ? { opacity: 0.7 } : null]}
      >
        <Text style={[typography.caption, { color: c.accent }]}>
          {copy.sleep.nightSummaryOpenLabel}
        </Text>
        <FontAwesome name="chevron-right" size={12} color={c.accent} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container} testID={SLEEP_NIGHT_DETAIL}>
      <View style={styles.nightHeader}>
        <Text style={[typography.subtitle, styles.nightTitle, { color: c.text }]}>{nightTitle}</Text>
        <FontAwesome name="moon-o" size={22} color={c.warning} />
      </View>

      {showSkeleton && isWearableSupported ? (
        <View style={[styles.nightCard, { backgroundColor: c.surface }]}>
          <SleepNightDetailSkeleton />
        </View>
      ) : null}

      {!showSkeleton && isWearableSupported ? (
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

          <SleepNightDetailWearable
            status={wearableStatus}
            selectedSummary={selectedSummary}
            selectedNightScore={selectedNightScore}
            methodDetails={methodDetails}
            trend={trend}
            trendDays={trendDays}
            onTrendDaysChange={setTrendDays}
            isLoading={isWearableLoading}
          />
        </View>
      ) : null}

      {!showSkeleton || !isWearableSupported ? (
        <RoomConditionsChart
          samples={samples}
          range={roomRange}
          title={copy.sleep.roomConditionsTitle}
          emptyMessage={copy.sleep.nightDetailEmpty}
          insight={resolveInsight}
          footer={detailsFooter}
          isLoading={showSkeleton}
        />
      ) : null}

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
