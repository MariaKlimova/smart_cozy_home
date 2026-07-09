import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildWearableQueryWindow } from '@/health/buildWearableQueryWindow';

describe('buildWearableQueryWindow', () => {
  it('строит окно от вечера накануне до утра дня пробуждения', () => {
    const window = buildWearableQueryWindow({
      nightDate: '2026-07-08',
      weekdayId: 'wed',
      startAt: new Date('2026-07-07T22:39:00'),
      endAt: new Date('2026-07-08T05:37:00'),
      hasScenarioData: true,
    });

    assert.equal(window.startAt.getFullYear(), 2026);
    assert.equal(window.startAt.getMonth(), 6);
    assert.equal(window.startAt.getDate(), 7);
    assert.equal(window.startAt.getHours(), 18);

    assert.equal(window.endAt.getFullYear(), 2026);
    assert.equal(window.endAt.getMonth(), 6);
    assert.equal(window.endAt.getDate(), 8);
    assert.equal(window.endAt.getHours(), 14);
  });
});
