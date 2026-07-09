import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { copy } from '@/copy/ru';
import {
  computeWearableSleepNormProgress,
  formatWearableBedtimeRange,
  formatWearableSleepDuration,
  formatWearableSleepQuality,
  formatWearableSourceName,
} from '@/features/sleep/lib/formatWearableNightSummary';
import { wearableQualityTierColor } from '@/features/sleep/lib/wearableQualityPresentation';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { SLEEP_NIGHT_DETAIL_WEARABLE } from './SleepNightDetail-Wearable.const';
import type { ISleepNightDetailWearableProps } from './SleepNightDetail-Wearable.typings';
import { styles } from './SleepNightDetail-Wearable.styles';

function openIosSettings(): void {
  void Linking.openSettings();
}

function openHealthApp(): void {
  void Linking.openURL('x-apple-health://');
}

export function SleepNightDetailWearable({
  wearable,
  isLoading,
  onOpenSettings,
}: ISleepNightDetailWearableProps) {
  const c = useThemeColors();

  if (isLoading) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]} testID={SLEEP_NIGHT_DETAIL_WEARABLE}>
        {copy.sleep.wearableLoading}
      </Text>
    );
  }

  if (wearable === null) {
    return null;
  }

  if (wearable.status === 'available' && wearable.summary) {
    const summary = wearable.summary;
    const bedtimeRange = formatWearableBedtimeRange(summary);
    const totalSleep =
      summary.totalSleepMinutes !== undefined && summary.totalSleepMinutes > 0
        ? formatWearableSleepDuration(summary.totalSleepMinutes)
        : null;
    const normProgress =
      summary.totalSleepMinutes !== undefined
        ? computeWearableSleepNormProgress(summary.totalSleepMinutes)
        : 0;
    const sourceLabel = formatWearableSourceName(
      summary.primarySourceName,
      summary.primarySourceBundleId,
    );
    const qualityLabel = formatWearableSleepQuality(summary);

    return (
      <View testID={SLEEP_NIGHT_DETAIL_WEARABLE}>
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

        {qualityLabel && summary.sleepQualityTier ? (
          <View style={styles.qualitySection}>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {copy.sleep.wearableQualityLabel}
            </Text>
            <View style={[styles.qualityBadge, { backgroundColor: c.accentMuted }]}>
              <Text
                style={[
                  typography.subtitle,
                  styles.qualityValue,
                  { color: wearableQualityTierColor(summary.sleepQualityTier, c) },
                ]}
              >
                {qualityLabel}
              </Text>
            </View>
          </View>
        ) : null}

        {summary.totalSleepMinutes !== undefined && summary.totalSleepMinutes > 0 ? (
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
      </View>
    );
  }

  let message: string = copy.sleep.wearableNoData;
  let showSettings = false;
  let showHealthApp = false;

  if (wearable.status === 'unavailable') {
    message = copy.sleep.wearableUnavailable;
  } else if (wearable.status === 'denied') {
    message = copy.sleep.wearableDenied;
    showSettings = Platform.OS === 'ios';
  } else if (wearable.status === 'error') {
    message = copy.sleep.wearableLoadError;
  } else if (wearable.status === 'no_data') {
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
