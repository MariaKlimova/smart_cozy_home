import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { buildWearableQueryWindow } from '@/health/buildWearableQueryWindow';

describe('buildWearableQueryWindow', () => {
  it('строит окно от bedtime−1ч накануне до wakeTime+6ч', () => {
    const window = buildWearableQueryWindow(
      {
        nightDate: '2026-07-08',
        weekdayId: 'wed',
        startAt: new Date('2026-07-07T22:39:00'),
        endAt: new Date('2026-07-08T05:37:00'),
        hasScenarioData: true,
      },
      DEFAULT_NIGHT_SCHEDULE,
    );

    assert.equal(window.startAt.getFullYear(), 2026);
    assert.equal(window.startAt.getMonth(), 6);
    assert.equal(window.startAt.getDate(), 7);
    assert.equal(window.startAt.getHours(), 22);

    assert.equal(window.endAt.getFullYear(), 2026);
    assert.equal(window.endAt.getMonth(), 6);
    assert.equal(window.endAt.getDate(), 8);
    assert.equal(window.endAt.getHours(), 14);
  });

  it('учитывает пользовательское расписание', () => {
    const window = buildWearableQueryWindow(
      {
        nightDate: '2026-07-08',
        weekdayId: 'wed',
        startAt: new Date('2026-07-07T21:00:00'),
        endAt: new Date('2026-07-08T07:00:00'),
        hasScenarioData: false,
      },
      { bedtime: '22:00', wakeTime: '07:00' },
    );

    assert.equal(window.startAt.getHours(), 21);
    assert.equal(window.endAt.getHours(), 13);
  });
});
