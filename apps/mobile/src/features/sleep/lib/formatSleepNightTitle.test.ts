import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatSleepNightDetailTitle } from '@/features/sleep/lib/formatSleepNightTitle';

describe('formatSleepNightTitle', () => {
  it('formats full weekday and date', () => {
    const title = formatSleepNightDetailTitle('2026-07-01');
    assert.equal(title, 'Ночь, среда, 1 июля');
  });

  it('formats date with two-digit day', () => {
    const title = formatSleepNightDetailTitle('2026-04-10');
    assert.equal(title, 'Ночь, пятница, 10 апреля');
  });
});
