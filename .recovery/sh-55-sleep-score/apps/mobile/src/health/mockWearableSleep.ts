import { Platform } from 'react-native';

import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { aggregateWearableNight } from '@/health/aggregateWearableNight';
import { bucketWearableSegmentsByNight } from '@/health/bucketWearableSegmentsByNight';
import { dedupeSleepSegments } from '@/health/dedupeSleepSegments';
import type {
  ISleepWearableSegment,
  IWearableSleepNightResult,
  TWearableMockPreset,
} from '@/health/healthKitSleep.typings';
import type { IWearableSleepHistoryResult } from '@/health/bucketWearableSegmentsByNight';

const VALID_PRESETS: readonly TWearableMockPreset[] = [
  'default',
  'empty',
  'denied',
  'dualSource',
  'fragmented',
];

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function segment(
  startAt: Date,
  durationMin: number,
  stage: ISleepWearableSegment['stage'],
  sourceName: string,
  sourceBundleId: string,
  trackerSleepScore?: number,
): ISleepWearableSegment {
  return {
    startAt,
    endAt: addMinutes(startAt, durationMin),
    stage,
    sourceName,
    sourceBundleId,
    ...(trackerSleepScore !== undefined ? { trackerSleepScore } : {}),
  };
}

/** Активный пресет моков или null на iOS без env */
export function getWearableMockPreset(): TWearableMockPreset | null {
  const raw = process.env.EXPO_PUBLIC_WEARABLE_MOCK;
  if (raw && VALID_PRESETS.includes(raw as TWearableMockPreset)) {
    return raw as TWearableMockPreset;
  }

  if (Platform.OS !== 'ios') {
    if (process.env.NODE_ENV === 'test') {
      return 'default';
    }
    return null;
  }

  return null;
}

function buildDefaultNightSegments(windowStart: Date): ISleepWearableSegment[] {
  const bedtime = addMinutes(windowStart, 30);
  return [
    segment(bedtime, 15, 'inBed', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 15), 90, 'asleepCore', 'Polar Flow', 'fi.polar.polarflow', 82),
    segment(addMinutes(bedtime, 105), 55, 'asleepDeep', 'Polar Flow', 'fi.polar.polarflow', 82),
    segment(addMinutes(bedtime, 160), 70, 'asleepREM', 'Polar Flow', 'fi.polar.polarflow', 82),
    segment(addMinutes(bedtime, 230), 20, 'asleepCore', 'Polar Flow', 'fi.polar.polarflow', 82),
    segment(addMinutes(bedtime, 250), 10, 'awake', 'Polar Flow', 'fi.polar.polarflow'),
  ];
}

function buildDualSourceSegments(windowStart: Date): ISleepWearableSegment[] {
  const bedtime = addMinutes(windowStart, 20);
  const polar = buildDefaultNightSegments(addMinutes(windowStart, -10));
  const watchSegments: ISleepWearableSegment[] = [
    segment(bedtime, 240, 'asleepUnspecified', 'Apple Watch', 'com.apple.health.watch'),
  ];
  return [...polar, ...watchSegments];
}

function buildFragmentedSegments(windowStart: Date): ISleepWearableSegment[] {
  const bedtime = addMinutes(windowStart, 45);
  return [
    segment(bedtime, 40, 'asleepCore', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 40), 8, 'awake', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 48), 25, 'asleepCore', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 73), 12, 'awake', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 85), 35, 'asleepDeep', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 120), 6, 'awake', 'Polar Flow', 'fi.polar.polarflow'),
    segment(addMinutes(bedtime, 126), 50, 'asleepREM', 'Polar Flow', 'fi.polar.polarflow'),
  ];
}

function buildSegmentsForPreset(
  preset: TWearableMockPreset,
  windowStart: Date,
  windowEnd: Date,
): ISleepWearableSegment[] {
  if (preset === 'empty') {
    return [];
  }

  if (preset === 'fragmented') {
    return buildFragmentedSegments(windowStart);
  }

  if (preset === 'dualSource') {
    return buildDualSourceSegments(windowStart);
  }

  void windowEnd;
  return buildDefaultNightSegments(windowStart);
}

/** Мок-результат wearable за ночное окно */
export function loadMockWearableSleepNight(
  preset: TWearableMockPreset,
  windowStart: Date,
  windowEnd: Date,
): IWearableSleepNightResult {
  if (preset === 'denied') {
    return { status: 'denied' };
  }

  const rawSegments = buildSegmentsForPreset(preset, windowStart, windowEnd);
  if (rawSegments.length === 0) {
    return { status: 'no_data' };
  }

  const deduped = dedupeSleepSegments(rawSegments);
  const summary = aggregateWearableNight(deduped);
  if (summary === null) {
    return { status: 'no_data' };
  }

  return {
    status: 'available',
    summary,
  };
}

/** Мок-история за несколько ночей (для score / тренда) */
export function loadMockWearableSleepHistory(
  preset: TWearableMockPreset,
  windows: ISleepNightWindow[],
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): IWearableSleepHistoryResult {
  if (preset === 'denied') {
    return { status: 'denied', nights: [] };
  }

  if (preset === 'empty') {
    return { status: 'no_data', nights: [] };
  }

  const allSegments: ISleepWearableSegment[] = [];
  for (const [index, window] of windows.entries()) {
    const jitterMinutes = (index % 5) * 8;
    const nightStart = addMinutes(window.startAt, jitterMinutes);
    const nightSegments = buildSegmentsForPreset(preset, nightStart, window.endAt);
    allSegments.push(...nightSegments);
  }

  if (allSegments.length === 0) {
    return { status: 'no_data', nights: [] };
  }

  const deduped = dedupeSleepSegments(allSegments);
  const nights = bucketWearableSegmentsByNight(deduped, windows, schedule);
  if (nights.length === 0) {
    return { status: 'no_data', nights: [] };
  }

  return { status: 'available', nights };
}
