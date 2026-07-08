import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatSleepWeekRangeFromEnd } from './formatSleepWeekRange';

describe('formatSleepWeekRange', () => {
  it('formats range within one month', () => {
    const label = formatSleepWeekRangeFromEnd(new Date(2026, 6, 7));
    assert.equal(label, '1–7 июл');
  });

  it('formats range across months', () => {
    const label = formatSleepWeekRangeFromEnd(new Date(2026, 5, 3));
    assert.equal(label, '28 мая – 3 июн');
  });
});
