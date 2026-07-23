import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IScenarioFieldDefinition } from '@/config/scenarioSettingsFields';
import { getScenarioFieldLabel, getScenarioSettingsFieldCopy } from '@/features/scenarios/lib/scenarioFieldLabels';
import {
  isSchedulePendingKey,
  toScheduleData,
} from '@/features/scenarios/lib/scenarioSettingsSchedule';
import { createUniformWeeklySchedule } from '@/domain/scenarioWeeklySchedule';

describe('getScenarioFieldLabel', () => {
  it('returns copy label by copyKey', () => {
    const field: IScenarioFieldDefinition = {
      key: 'brightness',
      kind: 'number',
      copyKey: 'brightness',
    };
    assert.equal(getScenarioFieldLabel(field), 'Яркость');
  });

  it('returns playlist label', () => {
    const field: IScenarioFieldDefinition = {
      key: 'playlist',
      kind: 'text',
      copyKey: 'playlist',
    };
    assert.equal(getScenarioFieldLabel(field), 'Плейлист');
  });

  it('resolves optional settings field copy keys', () => {
    assert.equal(getScenarioSettingsFieldCopy('playlistHint'), 'Пусто — без музыки. Алиса скажет «включи плейлист …»');
    assert.equal(getScenarioSettingsFieldCopy('playlistPlaceholder'), 'Например: вечерний джаз');
    assert.equal(getScenarioSettingsFieldCopy(undefined), undefined);
  });

  it('falls back to copyKey when missing in copy', () => {
    const field: IScenarioFieldDefinition = {
      key: 'unknown',
      kind: 'boolean',
      copyKey: 'unknown_key',
    };
    assert.equal(getScenarioFieldLabel(field), 'unknown_key');
  });
});

describe('scenarioSettingsSchedule', () => {
  it('strips isAvailable from schedule', () => {
    const data = createUniformWeeklySchedule(true, '08:00', '08:00');
    const schedule = { ...data, isAvailable: true };
    const stripped = toScheduleData(schedule);
    assert.deepEqual(stripped, data);
  });

  it('detects schedule pending keys', () => {
    assert.equal(isSchedulePendingKey('scheduleEnabled'), true);
    assert.equal(isSchedulePendingKey('weekday-mon'), true);
    assert.equal(isSchedulePendingKey('weekday-time-fri'), true);
    assert.equal(isSchedulePendingKey('brightness'), false);
    assert.equal(isSchedulePendingKey(undefined), false);
  });
});
