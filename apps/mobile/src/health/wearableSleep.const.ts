import type { TSleepWearableStage } from '@/health/healthKitSleep.typings';

/** Идентификатор типа сна в HealthKit */
export const HEALTHKIT_SLEEP_CATEGORY = 'HKCategoryTypeIdentifierSleepAnalysis' as const;

/** Стадии, которые считаются сном */
export const ASLEEP_WEARABLE_STAGES: readonly TSleepWearableStage[] = [
  'asleepCore',
  'asleepDeep',
  'asleepREM',
  'asleepUnspecified',
];

/** Детализация стадии для разрешения конфликтов */
export const WEARABLE_STAGE_DETAIL_RANK: Record<TSleepWearableStage, number> = {
  asleepDeep: 5,
  asleepREM: 4,
  asleepCore: 3,
  awake: 2,
  asleepUnspecified: 1,
  inBed: 0,
};

/** Приоритет источника по подстроке bundleId / имени (выше — предпочтительнее) */
export const WEARABLE_SOURCE_PRIORITY_HINTS: readonly { pattern: string; priority: number }[] = [
  { pattern: 'polar', priority: 100 },
  { pattern: 'oura', priority: 100 },
  { pattern: 'garmin', priority: 100 },
  { pattern: 'whoop', priority: 100 },
  { pattern: 'watch', priority: 80 },
  { pattern: 'apple', priority: 70 },
];

/** Норма сна для полоски, часы */
export const WEARABLE_SLEEP_NORM_MIN_HOURS = 7;

/** Верхняя граница нормы сна для полоски, часы */
export const WEARABLE_SLEEP_NORM_MAX_HOURS = 9;

/** Верхняя граница нормы сна для полоски, минуты */
export const WEARABLE_SLEEP_NORM_MAX_MINUTES = WEARABLE_SLEEP_NORM_MAX_HOURS * 60;

/** Приоритет источника по bundleId и имени (выше — предпочтительнее) */
export function getWearableSourcePriority(sourceBundleId: string, sourceName: string): number {
  const haystack = `${sourceBundleId} ${sourceName}`.toLowerCase();

  for (const hint of WEARABLE_SOURCE_PRIORITY_HINTS) {
    if (haystack.includes(hint.pattern)) {
      return hint.priority;
    }
  }

  return 50;
}

/** Подстрока-подсказка источника в нижнем регистре или undefined */
export function findWearableSourceHintPattern(haystack: string): string | undefined {
  const normalized = haystack.toLowerCase();

  for (const hint of WEARABLE_SOURCE_PRIORITY_HINTS) {
    if (normalized.includes(hint.pattern)) {
      return hint.pattern;
    }
  }

  return undefined;
}

/** Порог «отличного» качества сна */
export const WEARABLE_SLEEP_QUALITY_TIER_EXCELLENT_MIN = 85;

/** Порог «хорошего» качества сна */
export const WEARABLE_SLEEP_QUALITY_TIER_GOOD_MIN = 70;

/** Порог «нормального» качества сна */
export const WEARABLE_SLEEP_QUALITY_TIER_FAIR_MIN = 55;
