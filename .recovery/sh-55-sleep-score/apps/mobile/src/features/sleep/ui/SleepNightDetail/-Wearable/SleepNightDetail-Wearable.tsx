import { useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { copy } from '@/copy/ru';
import {
  computeWearableSleepNormProgress,
  formatSleepScoreValue,
  formatWearableBedtimeRange,
  formatWearableSleepDuration,
  formatWearableSourceName,
} from '@/features/sleep/lib/formatWearableNightSummary';
import { wearableQualityTierColor } from '@/features/sleep/lib/wearableQualityPresentation';
import { useThemeColors } from '@/hooks/useThemeColors';
import type {
  TSleepScoreExplainComponent,
  TSleepScoreTrendDays,
} from '@/health/sleepScore.typings';
import { CalmSegmented } from '@/ui/CalmSegmented';
import { typography } from '@/theme/tokens';

import { SleepNightDetailScoreBreakdown } from './-ScoreBreakdown';
import { SleepNightDetailScoreMethodSheet } from './-ScoreMethodSheet';
import {
  SLEEP_NIGHT_DETAIL_TREND_OPTIONS,
  SLEEP_NIGHT_DETAIL_WEARABLE,
} from './SleepNightDetail-Wearable.const';
import type { ISleepNightDetailWearableProps } from './SleepNightDetail-Wearable.typings';
import { styles } from './SleepNightDetail-Wearable.styles';

function openIosSettings(): void {
  void Linking.openSettings();
}

function openHealthApp(): void {
  void Linking.openURL('x-apple-health://');
}

export function SleepNightDetailWearable({
  status,
  selectedSummary,
  selectedNightScore,
  methodDetails,
  trend,
  trendDays,
  onTrendDaysChange,
  isLoading,
  onOpenSettings,
}: ISleepNightDetailWearableProps) {
  const c = useThemeColors();
  const [explainComponent, setExplainComponent] = useState<TSleepScoreExplainComponent | null>(
    null,
  );

  if (isLoading) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]} testID={SLEEP_NIGHT_DETAIL_WEARABLE}>
        {copy.sleep.wearableLoading}
      </Text>
    );
  }

  if (status === null) {
    return null;
  }

  const trendOptions = SLEEP_NIGHT_DETAIL_TREND_OPTIONS.map((option) => ({
    id: option.id,
    label: copy.sleep[option.labelKey],
  }));

  if (status === 'available') {
    const bedtimeRange = selectedSummary ? formatWearableBedtimeRange(selectedSummary) : null;
    const totalSleep =
      selectedSummary?.totalSleepMinutes !== undefined && selectedSummary.totalSleepMinutes > 0
        ? formatWearableSleepDuration(selectedSummary.totalSleepMinutes)
        : null;
    const normProgress =
      selectedSummary?.totalSleepMinutes !== undefined
        ? computeWearableSleepNormProgress(selectedSummary.totalSleepMinutes)
        : 0;
    const sourceLabel = formatWearableSourceName(
      selectedSummary?.primarySourceName,
      selectedSummary?.primarySourceBundleId,
    );
    const nightQualityLabel = selectedNightScore
      ? formatSleepScoreValue(selectedNightScore.score, selectedNightScore.tier)
      : null;
    const trendQualityLabel = trend
      ? formatSleepScoreValue(trend.score, trend.tier)
      : null;

    return (
      <View testID={SLEEP_NIGHT_DETAIL_WEARABLE}>
        {selectedSummary ? (
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={[typography.caption, { color: c.textMuted }]}>
                {copy.sleep.wearableBedtimeLabel}
              </Text>
              {bedtimeRange ? (
                <Text style={[typography.subtitle, styles.statValue, { color: c.text }]}>
                  {bedtimeRange}
                </Text>
              ) : null}
            </View>

            <View style={styles.statColumn}>
              <Text style={[typography.caption, { color: c.textMuted }]}>
                {copy.sleep.wearableTotalSleepLabel}
              </Text>
              {totalSleep ? (
                <Text style={[typography.subtitle, styles.statValue, { color: c.text }]}>
                  {totalSleep}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={[typography.body, styles.emptySection, { color: c.textMuted }]}>
            {copy.sleep.wearableNoData}
          </Text>
        )}

        {selectedNightScore && nightQualityLabel ? (
          <View style={styles.qualitySection}>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {copy.sleep.wearableScoreNightLabel}
            </Text>
            <View style={[styles.qualityBadge, { backgroundColor: c.accentMuted }]}>
              <Text
                style={[
                  typography.subtitle,
                  styles.qualityValue,
                  { color: wearableQualityTierColor(selectedNightScore.tier, c) },
                ]}
              >
                {nightQualityLabel}
              </Text>
            </View>
            <Text style={[typography.caption, styles.methodology, { color: c.textMuted }]}>
              {copy.sleep.wearableScoreMethodology}
            </Text>
            <SleepNightDetailScoreBreakdown
              components={selectedNightScore.components}
              isColdStart={selectedNightScore.isColdStart}
              onExplainComponent={setExplainComponent}
            />
            {selectedNightScore.belowRecommendedNorm ? (
              <Text style={[typography.caption, styles.belowNorm, { color: c.warning }]}>
                {copy.sleep.wearableScoreBelowNorm}
              </Text>
            ) : null}
          </View>
        ) : null}

        {trend && trendQualityLabel ? (
          <View style={styles.trendSection}>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {copy.sleep.wearableScoreTrendLabel}
            </Text>
            <CalmSegmented
              options={trendOptions}
              value={String(trendDays)}
              onValueChange={(value) => {
                if (value === '7' || value === '30') {
                  onTrendDaysChange(Number(value) as TSleepScoreTrendDays);
                }
              }}
            />
            <View style={[styles.trendBadge, { backgroundColor: c.accentMuted }]}>
              <Text
                style={[
                  typography.body,
                  { color: wearableQualityTierColor(trend.tier, c) },
                ]}
              >
                {trendQualityLabel}
              </Text>
            </View>
          </View>
        ) : null}

        {selectedSummary?.totalSleepMinutes !== undefined &&
        selectedSummary.totalSleepMinutes > 0 ? (
          <View style={styles.normSection}>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {copy.sleep.wearableSleepNorm}
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(normProgress * 100),
              }}
              style={[styles.normTrack, { backgroundColor: c.border }]}
            >
              <View
                style={[
                  styles.normFill,
                  {
                    width: `${Math.round(normProgress * 100)}%`,
                    backgroundColor: c.warning,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <View style={styles.footer}>
          <Feather name="watch" size={14} color={c.textMuted} />
          <Text style={[typography.caption, { color: c.textMuted }]}>
            {`${copy.sleep.wearableSectionTitle} · ${sourceLabel}`}
          </Text>
        </View>

        <SleepNightDetailScoreMethodSheet
          visible={explainComponent !== null}
          component={explainComponent}
          methodDetails={methodDetails}
          onClose={() => setExplainComponent(null)}
        />
      </View>
    );
  }

  let message: string = copy.sleep.wearableNoData;
  let showSettings = false;
  let showHealthApp = false;

  if (status === 'unavailable') {
    message = copy.sleep.wearableUnavailable;
  } else if (status === 'denied') {
    message = copy.sleep.wearableDenied;
    showSettings = Platform.OS === 'ios';
  } else if (status === 'error') {
    message = copy.sleep.wearableLoadError;
  } else if (status === 'no_data') {
    showHealthApp = Platform.OS === 'ios';
  }

  const handleOpenSettings = onOpenSettings ?? openIosSettings;

  return (
    <View style={styles.emptySection} testID={SLEEP_NIGHT_DETAIL_WEARABLE}>
      <Text style={[typography.body, { color: c.textMuted }]}>{message}</Text>

      {showSettings ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenSettings}
          style={({ pressed }) => [styles.actionButton, pressed ? { opacity: 0.7 } : null]}
        >
          <Text style={[typography.caption, { color: c.accent }]}>
            {copy.sleep.wearableOpenSettings}
          </Text>
        </Pressable>
      ) : null}

      {showHealthApp ? (
        <Pressable
          accessibilityRole="button"
          onPress={openHealthApp}
          style={({ pressed }) => [styles.actionButton, pressed ? { opacity: 0.7 } : null]}
        >
          <Text style={[typography.caption, { color: c.accent }]}>
            {copy.sleep.wearableOpenHealth}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
