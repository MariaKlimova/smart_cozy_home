import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createUniformWeeklySchedule,
  findNextScheduleRun,
  parseWeeklyScheduleJson,
  serializeWeeklyScheduleJson,
} from '@/domain/scenarioWeeklySchedule';

describe('scenarioWeeklySchedule', () => {
  it('roundtrips JSON', () => {
    const source = createUniformWeeklySchedule(true, '07:30', '07:00');
    const raw = serializeWeeklyScheduleJson(source);
    const parsed = parseWeeklyScheduleJson(raw, '07:00');
    assert.ok(parsed);
    assert.equal(parsed.enabled, true);
    assert.equal(parsed.weekdays.mon.time, '07:30');
  });

  it('finds next run on a later weekday', () => {
    const schedule = createUniformWeeklySchedule(true, '08:00', '08:00');
    for (const id of ['mon', 'tue', 'wed', 'thu', 'fri', 'sun'] as const) {
      schedule.weekdays[id].enabled = false;
    }
    schedule.weekdays.sat.enabled = true;
    schedule.weekdays.sat.time = '09:00';
    const now = new Date('2026-07-01T12:00:00'); // среда
    const next = findNextScheduleRun(schedule, now);
    assert.ok(next);
    assert.equal(next.weekdayId, 'sat');
    assert.equal(next.runAt.getHours(), 9);
  });

  it('returns null when schedule disabled', () => {
    const schedule = createUniformWeeklySchedule(false, '08:00', '08:00');
    assert.equal(findNextScheduleRun(schedule, new Date('2026-07-01T12:00:00')), null);
  });
});
