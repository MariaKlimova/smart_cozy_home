import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { copy } from '@/copy/ru';
import { formatWearableSleepDuration } from '@/features/sleep/lib/formatWearableNightSummary';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { ScaleLabel, SheetHeader, StatPair } from '../-SheetChrome';
import {
  DURATION_NORM_MAX_MINUTES,
  DURATION_NORM_MIN_MINUTES,
  DURATION_SCALE_MAX_MINUTES,
  DURATION_SCALE_MIN_MINUTES,
} from '../SleepNightDetail-ScoreMethodSheet.const';
import { styles } from '../SleepNightDetail-ScoreMethodSheet.styles';
import { clamp01, pct } from '../sleepChartAxis';
import type { ISleepNightDetailScoreMethodSheetDurationBodyProps } from './SleepNightDetail-ScoreMethodSheet-DurationBody.typings';

function durationScaleRatio(minutes: number): number {
  return clamp01(
    (minutes - DURATION_SCALE_MIN_MINUTES) /
      (DURATION_SCALE_MAX_MINUTES - DURATION_SCALE_MIN_MINUTES),
  );
}

function DurationScale({ tstMinutes }: { tstMinutes: number }) {
  const c = useThemeColors();
  const markerLeft = pct(durationScaleRatio(tstMinutes));
  const normStart = durationScaleRatio(DURATION_NORM_MIN_MINUTES);
  const normEnd = durationScaleRatio(DURATION_NORM_MAX_MINUTES);

  return (
    <View style={styles.scaleBlock}>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        {copy.sleep.wearableScoreDurationNorm}
      </Text>
      <View style={styles.scaleTrack}>
        <View style={[styles.scaleTrackInner, { backgroundColor: c.border }]}>
          <View style={[styles.scaleZone, { width: pct(normStart), backgroundColor: c.border }]} />
          <View
            style={[
              styles.scaleZone,
              { width: pct(normEnd - normStart), backgroundColor: c.success },
            ]}
          />
          <View style={[styles.scaleZone, { width: pct(1 - normEnd), backgroundColor: c.border }]} />
        </View>
        <View
          style={[
            styles.scaleMarker,
            {
              left: markerLeft,
              borderColor: c.accent,
              backgroundColor: c.surface,
            },
          ]}
        />
      </View>
      <View style={styles.scaleLabels}>
        <ScaleLabel label={copy.sleep.wearableScoreDurationAxis4} ratio={0} align="left" />
        <ScaleLabel
          label={copy.sleep.wearableScoreDurationAxis7}
          ratio={durationScaleRatio(DURATION_NORM_MIN_MINUTES)}
          align="center"
        />
        <ScaleLabel
          label={copy.sleep.wearableScoreDurationAxis9}
          ratio={durationScaleRatio(DURATION_NORM_MAX_MINUTES)}
          align="center"
        />
        <ScaleLabel label={copy.sleep.wearableScoreDurationAxis12} ratio={1} align="right" />
      </View>
    </View>
  );
}

export function SleepNightDetailScoreMethodSheetDurationBody({
  methodDetails,
}: ISleepNightDetailScoreMethodSheetDurationBodyProps) {
  const c = useThemeColors();
  const duration = methodDetails.duration;
  const tonight = formatWearableSleepDuration(duration.tstMinutes);
  let usual: string = copy.sleep.wearableScoreDurationMissing;
  if (duration.baselineMinutes !== undefined) {
    usual = formatWearableSleepDuration(Math.round(duration.baselineMinutes));
  }

  let bonusBanner: string | null = null;
  if (duration.appliedBaseline && duration.baselineModifier > 0) {
    if (duration.baselineModifier >= 10) {
      bonusBanner = copy.sleep.wearableScoreDurationBonusExact.replace(
        '{bonus}',
        String(duration.baselineModifier),
      );
    } else {
      bonusBanner = copy.sleep.wearableScoreDurationBonus.replace(
        '{bonus}',
        String(duration.baselineModifier),
      );
    }
  }

  return (
    <>
      <SheetHeader
        icon="moon"
        title={copy.sleep.wearableScoreDurationSheetTitle}
        score={duration.durationScore}
      />
      <StatPair
        leftLabel={copy.sleep.wearableScoreDurationTonight}
        leftValue={tonight}
        rightLabel={copy.sleep.wearableScoreDurationUsual}
        rightValue={usual}
      />
      <DurationScale tstMinutes={duration.tstMinutes} />
      {bonusBanner ? (
        <View style={[styles.bonusBanner, { backgroundColor: c.successMuted }]}>
          <Feather name="check" size={16} color={c.success} />
          <Text style={[typography.caption, styles.bonusText, { color: c.success }]}>
            {bonusBanner}
          </Text>
        </View>
      ) : null}
      {!duration.appliedBaseline ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.sleep.wearableScoreDurationNoBaseline}
        </Text>
      ) : null}
    </>
  );
}
