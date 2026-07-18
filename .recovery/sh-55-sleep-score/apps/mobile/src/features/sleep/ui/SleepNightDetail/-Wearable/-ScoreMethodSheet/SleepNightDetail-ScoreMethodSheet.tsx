import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { DimensionValue } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { copy } from '@/copy/ru';
import { parseTimeParts } from '@/domain/nightSchedule';
import { formatWearableSleepDuration } from '@/features/sleep/lib/formatWearableNightSummary';
import { useThemeColors } from '@/hooks/useThemeColors';
import type {
  ISleepScoreConsistencyNightRow,
  ISleepScoreMethodDetails,
} from '@/health/sleepScore.typings';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';
import { CalmSheet } from '@/ui/CalmSheet';
import { typography } from '@/theme/tokens';

import { SLEEP_NIGHT_DETAIL_SCORE_METHOD_SHEET } from './SleepNightDetail-ScoreMethodSheet.const';
import type { ISleepNightDetailScoreMethodSheetProps } from './SleepNightDetail-ScoreMethodSheet.typings';
import {
  CONSISTENCY_GOOD_MAX_MINUTES,
  CONSISTENCY_SCALE_MAX_MINUTES,
  DURATION_NORM_MAX_MINUTES,
  DURATION_NORM_MIN_MINUTES,
  DURATION_SCALE_MAX_MINUTES,
  DURATION_SCALE_MIN_MINUTES,
  SLEEP_CHART_PADDING_MINUTES,
  styles,
} from './SleepNightDetail-ScoreMethodSheet.styles';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function pct(ratio: number): DimensionValue {
  return `${Math.round(ratio * 1000) / 10}%`;
}

function durationScaleRatio(minutes: number): number {
  return clamp01(
    (minutes - DURATION_SCALE_MIN_MINUTES) /
      (DURATION_SCALE_MAX_MINUTES - DURATION_SCALE_MIN_MINUTES),
  );
}

function consistencyScaleRatio(minutes: number): number {
  return clamp01(minutes / CONSISTENCY_SCALE_MAX_MINUTES);
}

/** Минуты от локального полудня (вечер и утро на одной шкале) */
function overnightFromNoon(hours: number, minutes: number): number {
  const total = hours * 60 + minutes;
  const noon = 12 * 60;
  if (total >= noon) {
    return total - noon;
  }
  return total + (24 * 60 - noon);
}

function dateOvernightFromNoon(date: Date): number {
  return overnightFromNoon(date.getHours(), date.getMinutes());
}

function formatClockFromOvernight(overnightMinutes: number): string {
  const clock = (12 * 60 + Math.round(overnightMinutes)) % (24 * 60);
  const hours = Math.floor(clock / 60);
  const minutes = clock % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function roundDownToHour(overnightMinutes: number): number {
  return Math.floor(overnightMinutes / 60) * 60;
}

function roundUpToHour(overnightMinutes: number): number {
  return Math.ceil(overnightMinutes / 60) * 60;
}

interface ISleepChartAxis {
  /** Начало оси, мин от полудня */
  start: number;
  /** Конец оси, мин от полудня */
  end: number;
  /** Подпись начала */
  startLabel: string;
  /** Подпись конца */
  endLabel: string;
}

function buildSleepChartAxis(
  nights: ISleepScoreConsistencyNightRow[],
  bedtime: string,
  wakeTime: string,
): ISleepChartAxis {
  const bed = parseTimeParts(bedtime);
  const wake = parseTimeParts(wakeTime);
  let start = overnightFromNoon(bed.hours, bed.minutes) - SLEEP_CHART_PADDING_MINUTES;
  let end = overnightFromNoon(wake.hours, wake.minutes) + SLEEP_CHART_PADDING_MINUTES;

  for (const night of nights) {
    if (!night.fellAsleepAt || !night.wokeAt) {
      continue;
    }
    const fell = dateOvernightFromNoon(night.fellAsleepAt);
    const woke = dateOvernightFromNoon(night.wokeAt);
    start = Math.min(start, fell - SLEEP_CHART_PADDING_MINUTES);
    end = Math.max(end, woke + SLEEP_CHART_PADDING_MINUTES);
  }

  if (end <= start) {
    end = start + 8 * 60;
  }

  start = roundDownToHour(Math.max(0, start));
  end = roundUpToHour(end);

  return {
    start,
    end,
    startLabel: formatClockFromOvernight(start),
    endLabel: formatClockFromOvernight(end),
  };
}

function formatNightDateShort(nightDate: string): string {
  const [year, month, day] = nightDate.split('-').map(Number);
  if (!year || !month || !day) {
    return nightDate;
  }
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function ScaleLabel({
  label,
  ratio,
  align,
}: {
  label: string;
  ratio: number;
  align: 'left' | 'center' | 'right';
}) {
  const c = useThemeColors();
  let transform: { translateX: number }[] | undefined;
  if (align === 'center') {
    transform = [{ translateX: -20 }];
  } else if (align === 'right') {
    transform = [{ translateX: -40 }];
  }

  return (
    <Text
      style={[
        typography.caption,
        styles.scaleLabel,
        {
          color: c.textMuted,
          left: pct(ratio),
          transform,
        },
      ]}
    >
      {label}
    </Text>
  );
}

function SheetHeader({
  icon,
  title,
  score,
}: {
  icon: 'moon' | 'clock';
  title: string;
  score: number | null;
}) {
  const c = useThemeColors();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Feather name={icon} size={18} color={c.text} />
        <Text style={[typography.subtitle, { color: c.text }]}>{title}</Text>
      </View>
      {score !== null ? (
        <View style={[styles.scoreBadge, { backgroundColor: c.accentMuted }]}>
          <Text style={[typography.subtitle, { color: c.text }]}>{score}</Text>
        </View>
      ) : null}
    </View>
  );
}

function StatPair({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  const c = useThemeColors();

  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: c.background }]}>
        <Text style={[typography.caption, { color: c.textMuted }]}>{leftLabel}</Text>
        <Text style={[typography.subtitle, { color: c.text }]}>{leftValue}</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: c.background }]}>
        <Text style={[typography.caption, { color: c.textMuted }]}>{rightLabel}</Text>
        <Text style={[typography.subtitle, { color: c.text }]}>{rightValue}</Text>
      </View>
    </View>
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

function ConsistencyScale({ avgStdMinutes }: { avgStdMinutes: number }) {
  const c = useThemeColors();
  const markerLeft = pct(consistencyScaleRatio(avgStdMinutes));
  const goodWidth = pct(consistencyScaleRatio(CONSISTENCY_GOOD_MAX_MINUTES));
  const goodLabelRatio = CONSISTENCY_GOOD_MAX_MINUTES / CONSISTENCY_SCALE_MAX_MINUTES;

  return (
    <View style={styles.scaleBlock}>
      <Text style={[typography.caption, { color: c.text }]}>
        {copy.sleep.wearableScoreConsistencySpread.replace(
          '{minutes}',
          String(avgStdMinutes),
        )}
      </Text>
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
      <View style={styles.scaleLabels}>
        <ScaleLabel label={copy.sleep.wearableScoreConsistencyAxis0} ratio={0} align="left" />
        <ScaleLabel
          label={copy.sleep.wearableScoreConsistencyAxis15}
          ratio={goodLabelRatio}
          align="center"
        />
        <ScaleLabel label={copy.sleep.wearableScoreConsistencyAxis90} ratio={1} align="right" />
      </View>
    </View>
  );
}

function DurationBody({ methodDetails }: { methodDetails: ISleepScoreMethodDetails }) {
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
        <View style={[styles.bonusBanner, { backgroundColor: `${c.success}22` }]}>
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

function ConsistencyBody({ methodDetails }: { methodDetails: ISleepScoreMethodDetails }) {
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

export function SleepNightDetailScoreMethodSheet({
  visible,
  component,
  methodDetails,
  onClose,
}: ISleepNightDetailScoreMethodSheetProps) {
  return (
    <CalmSheet visible={visible} title="" onClose={onClose}>
      <View style={styles.content} testID={SLEEP_NIGHT_DETAIL_SCORE_METHOD_SHEET}>
        {methodDetails && component === 'duration' ? (
          <DurationBody methodDetails={methodDetails} />
        ) : null}
        {methodDetails && component === 'consistency' ? (
          <ConsistencyBody methodDetails={methodDetails} />
        ) : null}
      </View>
    </CalmSheet>
  );
}
