import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { INightSchedule } from '@/domain/nightSchedule.typings';

const SCHEDULE_KEY = 'sleep_night_schedule';

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function isValidNightSchedule(value: unknown): value is INightSchedule {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.bedtime === 'string' &&
    typeof record.wakeTime === 'string' &&
    TIME_PATTERN.test(record.bedtime) &&
    TIME_PATTERN.test(record.wakeTime)
  );
}

async function setStoredValue(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SCHEDULE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SCHEDULE_KEY, value);
}

async function getStoredValue(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(SCHEDULE_KEY) ?? null;
  }
  return SecureStore.getItemAsync(SCHEDULE_KEY);
}

export async function loadSleepSchedule(): Promise<INightSchedule | null> {
  const raw = await getStoredValue();
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidNightSchedule(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSleepSchedule(schedule: INightSchedule): Promise<void> {
  await setStoredValue(JSON.stringify(schedule));
}
