import Healthkit, { AuthorizationRequestStatus, AuthorizationStatus } from '@kingstinct/react-native-healthkit';
import { Platform } from 'react-native';

import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { aggregateWearableNight } from '@/health/aggregateWearableNight';
import { buildWearableQueryWindow } from '@/health/buildWearableQueryWindow';
import { dedupeSleepSegments } from '@/health/dedupeSleepSegments';
import type { IWearableSleepNightResult } from '@/health/healthKitSleep.typings';
import { mapHealthKitSleepSamples } from '@/health/mapHealthKitSleep';
import { getWearableMockPreset, loadMockWearableSleepNight } from '@/health/mockWearableSleep';
import { HEALTHKIT_SLEEP_CATEGORY } from '@/health/wearableSleep.const';

/**
 * Запрашивает чтение сна, если система ещё не спрашивала.
 * authorizationStatusFor отражает только запись (sharing), не чтение —
 * для read-only типов он часто sharingDenied даже при выданном доступе.
 */
async function ensureSleepReadAuthorization(): Promise<'ready' | 'denied' | 'unavailable'> {
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  const available = await Healthkit.isHealthDataAvailableAsync();
  if (!available) {
    return 'unavailable';
  }

  const requestStatus = await Healthkit.getRequestStatusForAuthorization({
    toRead: [HEALTHKIT_SLEEP_CATEGORY],
  });

  if (requestStatus === AuthorizationRequestStatus.shouldRequest) {
    await Healthkit.requestAuthorization({
      toRead: [HEALTHKIT_SLEEP_CATEGORY],
    });

    const statusAfter = await Healthkit.authorizationStatusFor(HEALTHKIT_SLEEP_CATEGORY);
    if (statusAfter === AuthorizationStatus.sharingDenied) {
      return 'denied';
    }
  }

  return 'ready';
}

/** Загружает wearable-данные за ночное окно */
export async function loadWearableSleepNight(
  nightWindow: ISleepNightWindow,
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): Promise<IWearableSleepNightResult> {
  const mockPreset = getWearableMockPreset();
  if (mockPreset !== null) {
    return loadMockWearableSleepNight(mockPreset, nightWindow.startAt, nightWindow.endAt);
  }

  try {
    const auth = await ensureSleepReadAuthorization();
    if (auth === 'unavailable') {
      return { status: 'unavailable' };
    }
    if (auth === 'denied') {
      return { status: 'denied' };
    }

    const queryWindow = buildWearableQueryWindow(nightWindow, schedule);

    const samples = await Healthkit.queryCategorySamples(HEALTHKIT_SLEEP_CATEGORY, {
      filter: {
        date: {
          startDate: queryWindow.startAt,
          endDate: queryWindow.endAt,
        },
      },
      ascending: true,
      limit: 0,
    });

    const mapped = mapHealthKitSleepSamples(samples);
    if (mapped.length === 0) {
      return { status: 'no_data' };
    }

    const deduped = dedupeSleepSegments(mapped);
    const summary = aggregateWearableNight(deduped, mapped);
    if (summary === null) {
      return { status: 'no_data' };
    }

    return {
      status: 'available',
      summary,
    };
  } catch {
    return { status: 'error' };
  }
}
