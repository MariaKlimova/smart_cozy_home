import { CategoryValueSleepAnalysis } from '@kingstinct/react-native-healthkit';
import type { CategorySampleTyped } from '@kingstinct/react-native-healthkit';

import { HEALTHKIT_SLEEP_CATEGORY } from '@/health/wearableSleep.const';

type TSleepCategorySample = CategorySampleTyped<typeof HEALTHKIT_SLEEP_CATEGORY>;

const HK_VALUE_LABEL: Record<number, string> = {
  [CategoryValueSleepAnalysis.inBed]: 'inBed',
  [CategoryValueSleepAnalysis.asleepUnspecified]: 'asleepUnspecified',
  [CategoryValueSleepAnalysis.awake]: 'awake',
  [CategoryValueSleepAnalysis.asleepCore]: 'asleepCore',
  [CategoryValueSleepAnalysis.asleepDeep]: 'asleepDeep',
  [CategoryValueSleepAnalysis.asleepREM]: 'asleepREM',
};

function serializeMetadata(metadata: TSleepCategorySample['metadata']): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const entries = Object.entries(metadata as Record<string, unknown>);
  if (entries.length === 0) {
    return null;
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Лог сырых HealthKit SleepAnalysis сэмплов до map/dedupe (только __DEV__) */
export function logRawHealthKitSleepSamples(
  samples: readonly TSleepCategorySample[],
  context: {
    /** Откуда вызвали */
    source: string;
    /** Начало окна запроса */
    rangeStart: Date;
    /** Конец окна запроса */
    rangeEnd: Date;
  },
): void {
  if (!__DEV__) {
    return;
  }

  const byValue: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const unknownValues = new Set<number>();

  const rows = samples.map((sample) => {
    const label = HK_VALUE_LABEL[sample.value] ?? `unknown(${sample.value})`;
    byValue[label] = (byValue[label] ?? 0) + 1;
    if (HK_VALUE_LABEL[sample.value] === undefined) {
      unknownValues.add(sample.value);
    }

    const sourceName = sample.sourceRevision?.source?.name ?? '?';
    const sourceBundleId = sample.sourceRevision?.source?.bundleIdentifier ?? '?';
    const sourceKey = `${sourceName} | ${sourceBundleId}`;
    bySource[sourceKey] = (bySource[sourceKey] ?? 0) + 1;

    const durationMin = Math.round(
      (sample.endDate.getTime() - sample.startDate.getTime()) / 60_000,
    );

    return {
      value: sample.value,
      stage: label,
      start: sample.startDate.toISOString(),
      end: sample.endDate.toISOString(),
      durationMin,
      sourceName,
      sourceBundleId,
      uuid: 'uuid' in sample ? (sample as { uuid?: string }).uuid : undefined,
      metadata: serializeMetadata(sample.metadata),
    };
  });

  // eslint-disable-next-line no-console -- temporary raw HK calibration
  console.log('[SleepScore:rawHK]', {
    source: context.source,
    rangeStart: context.rangeStart.toISOString(),
    rangeEnd: context.rangeEnd.toISOString(),
    sampleCount: samples.length,
    byValue,
    bySource,
    unknownValues: [...unknownValues],
  });
  // eslint-disable-next-line no-console -- temporary raw HK calibration
  console.log('[SleepScore:rawHK] samples (copy)', rows);
}
