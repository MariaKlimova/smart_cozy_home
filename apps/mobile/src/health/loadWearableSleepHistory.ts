import Healthkit from '@kingstinct/react-native-healthkit';
import { Platform } from 'react-native';

import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { buildWearableHistoryWindows } from '@/health/buildWearableHistoryWindows';
import { buildWearableQueryWindow } from '@/health/buildWearableQueryWindow';
import type { IWearableSleepHistoryResult } from '@/health/bucketWearableSegmentsByNight';
import { bucketWearableSegmentsByNight } from '@/health/bucketWearableSegmentsByNight';
import { dedupeSleepSegments } from '@/health/dedupeSleepSegments';
import { ensureSleepReadAuthorization } from '@/health/healthKitClient';
import { mapHealthKitSleepSamples } from '@/health/mapHealthKitSleep';
import {
  getWearableMockPreset,
  loadMockWearableSleepHistory,
} from '@/health/mockWearableSleep';
import { HEALTHKIT_SLEEP_CATEGORY } from '@/health/wearableSleep.const';

export type { IWearableSleepHistoryResult } from '@/health/bucketWearableSegmentsByNight';

/** Загружает ~31 ночь одним запросом HealthKit */
export async function loadWearableSleepHistory(
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
  historyEnd: Date = new Date(),
): Promise<IWearableSleepHistoryResult> {
  const windows = buildWearableHistoryWindows(historyEnd, schedule);
  const mockPreset = getWearableMockPreset();
  if (mockPreset !== null) {
    return loadMockWearableSleepHistory(mockPreset, windows, schedule);
  }

  if (Platform.OS !== 'ios') {
    return { status: 'unavailable', nights: [] };
  }

  try {
    const auth = await ensureSleepReadAuthorization();
    if (auth === 'unavailable') {
      return { status: 'unavailable', nights: [] };
    }
    if (auth === 'denied') {
      return { status: 'denied', nights: [] };
    }

    if (windows.length === 0) {
      return { status: 'no_data', nights: [] };
    }

    const firstWindow = windows[0];
    const lastWindow = windows[windows.length - 1];
    const rangeStart = buildWearableQueryWindow(firstWindow, schedule).startAt;
    const rangeEnd = buildWearableQueryWindow(lastWindow, schedule).endAt;

    const samples = await Healthkit.queryCategorySamples(HEALTHKIT_SLEEP_CATEGORY, {
      filter: {
        date: {
          startDate: rangeStart,
          endDate: rangeEnd,
        },
      },
      ascending: true,
      limit: 0,
    });

    const mapped = mapHealthKitSleepSamples(samples);
    if (mapped.length === 0) {
      return { status: 'no_data', nights: [] };
    }

    const deduped = dedupeSleepSegments(mapped);
    const nights = bucketWearableSegmentsByNight(deduped, windows, schedule);
    if (nights.length === 0) {
      return { status: 'no_data', nights: [] };
    }

    return { status: 'available', nights };
  } catch {
    return { status: 'error', nights: [] };
  }
}
