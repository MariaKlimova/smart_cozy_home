import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createUniformWeeklySchedule } from '@/domain/scenarioWeeklySchedule';
import {
  isSchedulePendingKey,
  toScheduleData,
} from '@/features/scenarios/lib/scenarioSettingsSchedule';

describe('scenarioSettingsSchedule', () => {
  it('strips HA availability metadata', () => {
    const schedule = createUniformWeeklySchedule(true, '07:00', '07:00');
    const data = toScheduleData({ ...schedule, isAvailable: true });
    assert.ok(data);
    assert.equal(data.enabled, true);
    assert.equal('isAvailable' in data, false);
  });

  it('returns null for undefined schedule', () => {
    assert.equal(toScheduleData(undefined), null);
  });

  it('detects schedule pending keys', () => {
    assert.equal(isSchedulePendingKey('scheduleEnabled'), true);
    assert.equal(isSchedulePendingKey('weekday-mon'), true);
    assert.equal(isSchedulePendingKey('weekday-time-fri'), true);
    assert.equal(isSchedulePendingKey('brightness'), false);
    assert.equal(isSchedulePendingKey(undefined), false);
  });
});
