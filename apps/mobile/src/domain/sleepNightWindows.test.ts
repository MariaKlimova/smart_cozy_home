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

  it('привязывает ночь к дате пробуждения', () => {
    const weekEnd = new Date('2026-07-08T12:00:00');
    const windows = resolveNightWindows({
      weekEnd,
      logbookEntries: [],
      eveningEntityId: 'script.evening',
      morningEntityId: 'script.morning',
    });

    const today = windows.find((window) => window.nightDate === '2026-07-08');
    assert.ok(today);
    assert.equal(today.weekdayId, 'wed');
    assert.equal(today.startAt.getDate(), 7);
    assert.equal(today.endAt.getDate(), 8);
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

    const target = windows.find((window) => window.nightDate === '2026-07-02');
    assert.ok(target);
    assert.equal(target.hasScenarioData, true);
    assert.equal(target.startAt.toISOString(), new Date('2026-07-01T22:15:00').toISOString());
    assert.equal(target.endAt.toISOString(), new Date('2026-07-02T07:45:00').toISOString());
    assert.equal(target.weekdayId, 'thu');
  });

  it('uses user night schedule for fallback windows', () => {
    const weekEnd = new Date('2026-07-02T12:00:00');
    const windows = resolveNightWindows({
      weekEnd,
      logbookEntries: [],
      eveningEntityId: 'script.evening',
      morningEntityId: 'script.morning',
      nightSchedule: { bedtime: '22:00', wakeTime: '07:00' },
    });

    const target = windows.find((window) => window.nightDate === '2026-07-02');
    assert.ok(target);
    assert.equal(target.startAt.getHours(), 22);
    assert.equal(target.endAt.getHours(), 7);
  });
});
