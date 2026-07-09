import { CategoryValueSleepAnalysis } from '@kingstinct/react-native-healthkit';
import type { CategorySampleTyped } from '@kingstinct/react-native-healthkit';

import type { ISleepWearableSegment, TSleepWearableStage } from '@/health/healthKitSleep.typings';
import { extractTrackerSleepScoreFromMetadata } from '@/health/extractTrackerSleepScore';
import { HEALTHKIT_SLEEP_CATEGORY } from '@/health/wearableSleep.const';

type TSleepCategorySample = CategorySampleTyped<typeof HEALTHKIT_SLEEP_CATEGORY>;

const STAGE_BY_HK_VALUE: Record<number, TSleepWearableStage> = {
  [CategoryValueSleepAnalysis.inBed]: 'inBed',
  [CategoryValueSleepAnalysis.asleepUnspecified]: 'asleepUnspecified',
  [CategoryValueSleepAnalysis.awake]: 'awake',
  [CategoryValueSleepAnalysis.asleepCore]: 'asleepCore',
  [CategoryValueSleepAnalysis.asleepDeep]: 'asleepDeep',
  [CategoryValueSleepAnalysis.asleepREM]: 'asleepREM',
};

/** Маппинг значения HealthKit в доменную стадию */
export function mapHealthKitSleepStage(value: number): TSleepWearableStage | null {
  return STAGE_BY_HK_VALUE[value] ?? null;
}

/** Маппинг сэмпла HealthKit в доменный сегмент */
export function mapHealthKitSleepSample(sample: TSleepCategorySample): ISleepWearableSegment | null {
  const stage = mapHealthKitSleepStage(sample.value);
  if (stage === null) {
    return null;
  }

  const sourceName = sample.sourceRevision.source.name;
  const sourceBundleId = sample.sourceRevision.source.bundleIdentifier;
  const trackerSleepScore = extractTrackerSleepScoreFromMetadata(sample.metadata);

  return {
    startAt: sample.startDate,
    endAt: sample.endDate,
    stage,
    sourceName,
    sourceBundleId,
    ...(trackerSleepScore !== undefined ? { trackerSleepScore } : {}),
  };
}

/** Маппинг массива сэмплов HealthKit */
export function mapHealthKitSleepSamples(samples: readonly TSleepCategorySample[]): ISleepWearableSegment[] {
  const mapped: ISleepWearableSegment[] = [];

  for (const sample of samples) {
    const segment = mapHealthKitSleepSample(sample);
    if (segment !== null) {
      mapped.push(segment);
    }
  }

  return mapped;
}
