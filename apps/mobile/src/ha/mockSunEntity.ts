import type { IMockEntitySnapshot } from '@/config/scenarioMocks';

function nextLocalTime(now: Date, hour: number, minute: number): Date {
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

function isSunAboveHorizon(now: Date): boolean {
  const hour = now.getHours();
  return hour >= 6 && hour < 21;
}

/** Снимок sun.sun с ближайшими rising/setting в будущем (для mock-store) */
export function buildMockSunSnapshot(now: Date = new Date()): IMockEntitySnapshot {
  const nextRising = nextLocalTime(now, 5, 30);
  const nextSetting = nextLocalTime(now, 21, 0);

  return {
    state: isSunAboveHorizon(now) ? 'above_horizon' : 'below_horizon',
    attributes: {
      next_rising: nextRising.toISOString(),
      next_setting: nextSetting.toISOString(),
      friendly_name: 'Солнце',
    },
  };
}
