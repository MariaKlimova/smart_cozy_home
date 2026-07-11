import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_NIGHT_SCHEDULE,
  isEveningTime,
  isMorningTime,
  isNightTime,
} from '@/domain/nightSchedule';

const schedule = DEFAULT_NIGHT_SCHEDULE;

describe('nightSchedule', () => {
  it('isNightTime covers bedtime through wake across midnight', () => {
    assert.equal(isNightTime(new Date(2026, 6, 9, 22, 59), schedule), false);
    assert.equal(isNightTime(new Date(2026, 6, 9, 23, 0), schedule), true);
    assert.equal(isNightTime(new Date(2026, 6, 10, 2, 0), schedule), true);
    assert.equal(isNightTime(new Date(2026, 6, 10, 7, 59), schedule), true);
    assert.equal(isNightTime(new Date(2026, 6, 10, 8, 0), schedule), false);
  });

  it('isMorningTime is wakeTime until wakeTime + 3h', () => {
    assert.equal(isMorningTime(new Date(2026, 6, 10, 7, 59), schedule), false);
    assert.equal(isMorningTime(new Date(2026, 6, 10, 8, 0), schedule), true);
    assert.equal(isMorningTime(new Date(2026, 6, 10, 10, 59), schedule), true);
    assert.equal(isMorningTime(new Date(2026, 6, 10, 11, 0), schedule), false);
  });

  it('isEveningTime is 3h before bedtime until bedtime', () => {
    assert.equal(isEveningTime(new Date(2026, 6, 9, 19, 59), schedule), false);
    assert.equal(isEveningTime(new Date(2026, 6, 9, 20, 0), schedule), true);
    assert.equal(isEveningTime(new Date(2026, 6, 9, 22, 59), schedule), true);
    assert.equal(isEveningTime(new Date(2026, 6, 9, 23, 0), schedule), false);
  });

  it('respects custom schedule', () => {
    const custom = { bedtime: '22:00', wakeTime: '07:00' };
    assert.equal(isNightTime(new Date(2026, 6, 9, 21, 59), custom), false);
    assert.equal(isNightTime(new Date(2026, 6, 9, 22, 0), custom), true);
    assert.equal(isMorningTime(new Date(2026, 6, 10, 9, 59), custom), true);
    assert.equal(isMorningTime(new Date(2026, 6, 10, 10, 0), custom), false);
  });
});
