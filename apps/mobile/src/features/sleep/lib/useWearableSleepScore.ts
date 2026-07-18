import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { aggregateSleepScoreTrend } from '@/health/aggregateSleepScoreTrend';
import { buildSleepScoreMethodDetails } from '@/health/buildSleepScoreMethodDetails';
import { computeSleepScoresForHistory } from '@/health/computeSleepScore';
import type {
  ISleepWearableNightSummary,
  TWearableSleepStatus,
} from '@/health/healthKitSleep.typings';
import { loadWearableSleepHistory } from '@/health/loadWearableSleepHistory';
import type {
  ISleepScoreMethodDetails,
  ISleepScoreResult,
  ISleepScoreTrend,
  TSleepScoreTrendDays,
} from '@/health/sleepScore.typings';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';

const WEARABLE_SLEEP_HISTORY_STALE_MS = 5 * 60 * 1000;

export interface IUseWearableSleepScoreOptions {
  /** Дата выбранной ночи YYYY-MM-DD */
  selectedNightDate: string | null;
  /** Окно тренда */
  trendDays: TSleepScoreTrendDays;
  /** Запрашивать данные */
  enabled?: boolean;
}

export interface IUseWearableSleepScoreResult {
  /** Статус истории */
  status: TWearableSleepStatus | null;
  /** Сводка выбранной ночи из кэша */
  selectedSummary: ISleepWearableNightSummary | null;
  /** Score выбранной ночи */
  selectedNightScore: ISleepScoreResult | null;
  /** Детали методики для шторы */
  methodDetails: ISleepScoreMethodDetails | null;
  /** Тренд за 7/30 дней */
  trend: ISleepScoreTrend | null;
  /** Идёт первая загрузка */
  isLoading: boolean;
}

/** Один кэш истории (~31 ночь); смена дня — только select */
export function useWearableSleepScore(
  options: IUseWearableSleepScoreOptions,
): IUseWearableSleepScoreResult {
  const { selectedNightDate, trendDays, enabled = true } = options;
  const nightSchedule = useSleepScheduleStore((s) => s.schedule);

  const query = useQuery({
    queryKey: [
      'wearable-sleep-history',
      nightSchedule.bedtime,
      nightSchedule.wakeTime,
    ],
    enabled,
    staleTime: WEARABLE_SLEEP_HISTORY_STALE_MS,
    queryFn: () => loadWearableSleepHistory(nightSchedule),
  });

  const nights = useMemo(
    () => query.data?.nights ?? [],
    [query.data?.nights],
  );
  const status = query.data?.status ?? null;

  const nightScores = useMemo(
    () => computeSleepScoresForHistory(nights.map((night) => night.scoreInput)),
    [nights],
  );

  const selectedIndex = useMemo(() => {
    if (!selectedNightDate) {
      return -1;
    }
    return nights.findIndex((night) => night.nightDate === selectedNightDate);
  }, [nights, selectedNightDate]);

  const selectedSummary =
    selectedIndex >= 0 ? nights[selectedIndex].summary : null;
  const selectedNightScore =
    selectedIndex >= 0 ? nightScores[selectedIndex] ?? null : null;

  const methodDetails = useMemo(() => {
    if (selectedIndex < 0 || !selectedNightScore) {
      return null;
    }
    return buildSleepScoreMethodDetails(
      nights.map((night) => night.scoreInput),
      selectedIndex,
      selectedNightScore,
    );
  }, [nights, selectedIndex, selectedNightScore]);

  const trend = useMemo(
    () => aggregateSleepScoreTrend(nightScores, trendDays),
    [nightScores, trendDays],
  );

  return {
    status,
    selectedSummary,
    selectedNightScore,
    methodDetails,
    trend,
    isLoading: query.isPending,
  };
}
