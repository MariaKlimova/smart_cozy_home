import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ISleepScoreConsistencyNightRow } from '@/health/sleepScore.typings';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';
import { typography } from '@/theme/tokens';

import { SheetHeader, StatPair } from '../-SheetChrome';
import {
  CONSISTENCY_GOOD_MAX_MINUTES,
  CONSISTENCY_SCALE_MAX_MINUTES,
} from '../SleepNightDetail-ScoreMethodSheet.const';
import { styles } from '../SleepNightDetail-ScoreMethodSheet.styles';
import {
  buildSleepChartAxis,
  clamp01,
  dateOvernightFromNoon,
  formatNightDateShort,
  pct,
} from '../sleepChartAxis';
import type { ISleepNightDetailScoreMethodSheetConsistencyBodyProps } from './SleepNightDetail-ScoreMethodSheet-ConsistencyBody.typings';

function consistencyScaleRatio(minutes: number): number {
  return clamp01(minutes / CONSISTENCY_SCALE_MAX_MINUTES);
}

function ConsistencyScale({ avgStdMinutes }: { avgStdMinutes: number }) {
  const c = useThemeColors();
  const markerLeft = pct(consistencyScaleRatio(avgStdMinutes));
  const goodWidth = pct(consistencyScaleRatio(CONSISTENCY_GOOD_MAX_MINUTES));
  const goodLabelLeft = pct(consistencyScaleRatio(CONSISTENCY_GOOD_MAX_MINUTES));

  let spreadLabel = copy.sleep.wearableScoreConsistencySpread.replace(
    '{minutes}',
    String(avgStdMinutes),
  );
  let maxAxisLabel: string = copy.sleep.wearableScoreConsistencyAxis90;
  if (avgStdMinutes > CONSISTENCY_SCALE_MAX_MINUTES) {
    spreadLabel = copy.sleep.wearableScoreConsistencySpreadOver;
    maxAxisLabel = copy.sleep.wearableScoreConsistencyAxisOver90;
  }

  return (
    <View style={styles.scaleBlock}>
      <Text style={[typography.caption, { color: c.text }]}>{spreadLabel}</Text>
      <View style={styles.scaleThresholdRow}>
        <Text
          style={[
            typography.caption,
            styles.scaleThresholdLabel,
            {
              color: c.textMuted,
              left: goodLabelLeft,
              transform: [{ translateX: '-50%' }],
            },
          ]}
        >
          {copy.sleep.wearableScoreConsistencyAxis15}
        </Text>
      </View>
      <View style={styles.scaleTrack}>
        <View style={[styles.scaleTrackInner, { backgroundColor: c.border }]}>
          <View style={[styles.scaleZone, { width: goodWidth, backgroundColor: c.success }]} />
        </View>
        <View
          style={[
            styles.scaleMarker,
            {
              left: markerLeft,
              borderColor: c.danger,
              backgroundColor: c.surface,
            },
          ]}
        />
      </View>
      <View style={styles.scaleLabelsEnds}>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.sleep.wearableScoreConsistencyAxis0}
        </Text>
        <Text style={[typography.caption, { color: c.textMuted }]}>{maxAxisLabel}</Text>
      </View>
    </View>
  );
}

function ConsistencyNightsChart({
  nights,
}: {
  nights: ISleepScoreConsistencyNightRow[];
}) {
  const c = useThemeColors();
  const schedule = useSleepScheduleStore((s) => s.schedule);
  const axis = buildSleepChartAxis(nights, schedule.bedtime, schedule.wakeTime);
  const span = Math.max(axis.end - axis.start, 1);

  return (
    <View style={styles.nightsBlock}>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        {copy.sleep.wearableScoreConsistencyNightsTitle}
      </Text>
      {nights.map((night) => {
        const dateLabel = formatNightDateShort(night.nightDate);
        let bar: ReactNode = null;
        if (night.fellAsleepAt && night.wokeAt) {
          const start = dateOvernightFromNoon(night.fellAsleepAt) - axis.start;
          const end = dateOvernightFromNoon(night.wokeAt) - axis.start;
          let widthMinutes = end - start;
          if (widthMinutes < 0) {
            widthMinutes += span;
          }
          const leftPct = pct(clamp01(start / span));
          const widthPct = pct(Math.max(clamp01(widthMinutes / span), 0.02));
          bar = (
            <View
              style={[
                styles.nightBar,
                {
                  left: leftPct,
                  width: widthPct,
                  backgroundColor: c.accent,
                },
              ]}
            />
          );
        }

        return (
          <View key={night.nightDate} style={styles.nightRow}>
            <Text style={[typography.caption, styles.nightDate, { color: c.textMuted }]}>
              {dateLabel}
            </Text>
            <View style={[styles.nightTrack, { backgroundColor: c.background }]}>{bar}</View>
          </View>
        );
      })}
      <View style={styles.nightAxis}>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.sleep.wearableScoreConsistencyAxisTime.replace('{time}', axis.startLabel)}
        </Text>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.sleep.wearableScoreConsistencyAxisTime.replace('{time}', axis.endLabel)}
        </Text>
      </View>
    </View>
  );
}

export function SleepNightDetailScoreMethodSheetConsistencyBody({
  methodDetails,
}: ISleepNightDetailScoreMethodSheetConsistencyBodyProps) {
  const c = useThemeColors();
  const consistency = methodDetails.consistency;

  if (consistency.isCollecting) {
    return (
      <>
        <SheetHeader
          icon="clock"
          title={copy.sleep.wearableScoreConsistencySheetTitle}
          score={null}
        />
        <Text style={[typography.body, { color: c.textMuted }]}>
          {copy.sleep.wearableScoreConsistencyCollecting}
        </Text>
        {consistency.nights.length > 0 ? (
          <ConsistencyNightsChart nights={consistency.nights} />
        ) : null}
      </>
    );
  }

  const bedStd = consistency.bedtimeStdMinutes ?? 0;
  const wakeStd = consistency.wakeStdMinutes ?? 0;
  const avgStd = consistency.avgStdMinutes ?? 0;

  return (
    <>
      <SheetHeader
        icon="clock"
        title={copy.sleep.wearableScoreConsistencySheetTitle}
        score={consistency.consistencyScore}
      />
      <StatPair
        leftLabel={copy.sleep.wearableScoreConsistencyBedtime}
        leftValue={copy.sleep.wearableScoreConsistencyStd.replace('{minutes}', String(bedStd))}
        rightLabel={copy.sleep.wearableScoreConsistencyWake}
        rightValue={copy.sleep.wearableScoreConsistencyStd.replace('{minutes}', String(wakeStd))}
      />
      <ConsistencyScale avgStdMinutes={avgStd} />
      <ConsistencyNightsChart nights={consistency.nights} />
    </>
  );
}
