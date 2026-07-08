import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getWeekEndForOffset, resolveNightWindows } from '@/domain/sleepNightWindows';

describe('sleepNightWindows', () => {
  it('builds seven nights ending on weekEnd', () => {
    const weekEnd = new Date('2026-07-07T12:00:00');
    const windows = resolveNightWindows({
      weekEnd,
      logbookEntries: [],
      eveningEntityId: 'script.evening',
      morningEntityId: 'script.morning',
    });

    assert.equal(windows.length, 7);
    assert.equal(windows[0].nightDate, '2026-07-01');
    assert.equal(windows[6].nightDate, '2026-07-07');
    assert.equal(windows[0].weekdayId, 'wed');
    assert.equal(windows[6].weekdayId, 'tue');
    assert.equal(windows[0].hasScenarioData, false);
  });

  it('uses logbook runs when available', () => {
    const weekEnd = new Date('2026-07-02T12:00:00');
    const windows = resolveNightWindows({
      weekEnd,
      logbookEntries: [
        { when: '2026-07-01T22:15:00', scriptId: 'script.evening' },
        { when: '2026-07-02T07:45:00', scriptId: 'script.morning' },
      ],
      eveningEntityId: 'script.evening',
      morningEntityId: 'script.morning',
    });

    const target = windows.find((window) => window.nightDate === '2026-07-01');
    assert.ok(target);
    assert.equal(target.hasScenarioData, true);
    assert.equal(target.startAt.toISOString(), new Date('2026-07-01T22:15:00').toISOString());
    assert.equal(target.endAt.toISOString(), new Date('2026-07-02T07:45:00').toISOString());
  });

  it('shifts week end by offset', () => {
    const now = new Date(2026, 6, 14, 10, 0, 0);
    const current = getWeekEndForOffset(0, now);
    const previous = getWeekEndForOffset(1, now);

    assert.equal(current.getFullYear(), 2026);
    assert.equal(current.getMonth(), 6);
    assert.equal(current.getDate(), 14);
    assert.equal(previous.getDate(), 7);
  });
});
