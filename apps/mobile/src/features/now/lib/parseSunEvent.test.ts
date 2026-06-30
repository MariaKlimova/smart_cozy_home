import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseSunEventFromHaState } from '@/features/now/lib/parseSunEvent';

describe('parseSunEventFromHaState', () => {
  it('returns nearest sunset after morning sunrise', () => {
    const now = new Date('2026-06-30T07:52:00+03:00');
    const result = parseSunEventFromHaState(
      {
        entityId: 'sun.sun',
        state: 'below_horizon',
        attributes: {
          next_rising: '2026-07-01T05:18:00+03:00',
          next_setting: '2026-06-30T21:32:00+03:00',
        },
      },
      now,
    );

    assert.ok(result);
    assert.equal(result.kind, 'sunset');
    assert.equal(result.time, '21:32');
  });

  it('returns nearest sunrise late at night', () => {
    const now = new Date('2026-06-30T23:10:00+03:00');
    const result = parseSunEventFromHaState(
      {
        entityId: 'sun.sun',
        state: 'below_horizon',
        attributes: {
          next_rising: '2026-07-01T05:18:00+03:00',
          next_setting: '2026-07-01T21:32:00+03:00',
        },
      },
      now,
    );

    assert.ok(result);
    assert.equal(result.kind, 'sunrise');
    assert.equal(result.time, '05:18');
  });

  it('ignores past sunrise and picks upcoming sunset during the day', () => {
    const now = new Date('2026-06-30T12:00:00+03:00');
    const result = parseSunEventFromHaState(
      {
        entityId: 'sun.sun',
        state: 'above_horizon',
        attributes: {
          next_rising: '2026-06-30T05:18:00+03:00',
          next_setting: '2026-06-30T21:32:00+03:00',
        },
      },
      now,
    );

    assert.ok(result);
    assert.equal(result.kind, 'sunset');
    assert.equal(result.time, '21:32');
  });
});
