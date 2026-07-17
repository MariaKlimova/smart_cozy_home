import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SCENARIO_DEFINITIONS } from '@/config/scenarios';
import { formatScenarioSchedule } from '@/config/formatScenarioSchedule';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  createUniformWeeklySchedule,
  serializeWeeklyScheduleJson,
} from '@/domain/scenarioWeeklySchedule';
import { mapAllScenarioSchedules, mapScenarioSettings } from '@/ha/mappers/mapScenarioSettings';

describe('formatScenarioSchedule', () => {
  const morning = SCENARIO_DEFINITIONS.find((s) => s.id === 'morning')!;

  it('returns empty when schedule disabled', () => {
    const schedule = createUniformWeeklySchedule(false, '07:00', '07:00');
    const result = formatScenarioSchedule(
      morning,
      { enabled: schedule.enabled, weekdays: schedule.weekdays },
      new Date('2026-07-01T12:00:00'),
    );
    assert.equal(result, '');
  });

  it('returns weekday label for distant day', () => {
    const schedule = createUniformWeeklySchedule(true, '07:00', '07:00');
    for (const id of Object.keys(schedule.weekdays) as (keyof typeof schedule.weekdays)[]) {
      schedule.weekdays[id].enabled = false;
    }
    schedule.weekdays.sat.enabled = true;
    schedule.weekdays.sat.time = '08:00';

    const result = formatScenarioSchedule(
      morning,
      { enabled: schedule.enabled, weekdays: schedule.weekdays },
      new Date('2026-07-01T12:00:00'),
    );
    assert.match(result, /08:00/);
    assert.match(result, /Сб/);
  });
});

describe('mapScenarioSettings', () => {
  it('maps weekly schedule from input_text', () => {
    const params = HA_ENTITIES.scenarioParams.morning;
    const json = serializeWeeklyScheduleJson(createUniformWeeklySchedule(true, '07:15', '07:00'));

    const settings = mapScenarioSettings(
      'morning',
      [
        { entityId: params.brightness, state: '80', attributes: {} },
        { entityId: params.warmupMinutes, state: '20', attributes: {} },
        { entityId: params.scheduleConfig, state: json, attributes: {} },
      ],
      '07:00',
    );

    assert.equal(settings.schedule.enabled, true);
    assert.equal(settings.schedule.weekdays.mon.time, '07:15');
    assert.equal(settings.schedule.isAvailable, true);
    assert.equal(settings.colors.length, 0);
  });

  it('maps sleep nightlight color with presets', () => {
    const params = HA_ENTITIES.scenarioParams.sleep;
    const presets = [
      {
        id: 'color-0',
        displayRgb: [242, 145, 61] as [number, number, number],
        color: { kind: 'rgb' as const, rgb: [242, 145, 61] as [number, number, number] },
      },
      {
        id: 'color-1',
        displayRgb: [134, 168, 249] as [number, number, number],
        color: { kind: 'rgb' as const, rgb: [134, 168, 249] as [number, number, number] },
      },
    ];

    const settings = mapScenarioSettings(
      'sleep',
      [
        { entityId: params.temperature, state: '17', attributes: {} },
        { entityId: params.window, state: 'off', attributes: {} },
        { entityId: params.nightlight, state: 'on', attributes: {} },
        { entityId: params.nightlightBrightness, state: '8', attributes: {} },
        {
          entityId: params.nightlightColor,
          state: '{"rgb_color":[134,168,249]}',
          attributes: {},
        },
        {
          entityId: params.scheduleConfig,
          state: serializeWeeklyScheduleJson(createUniformWeeklySchedule(false, '23:00', '23:00')),
          attributes: {},
        },
      ],
      '23:00',
      { colorPresetsByKey: { nightlightColor: presets } },
    );

    assert.equal(settings.colors.length, 1);
    assert.equal(settings.colors[0]?.key, 'nightlightColor');
    assert.equal(settings.colors[0]?.colorPresetId, 'color-1');
    assert.equal(settings.colors[0]?.isAvailable, true);
  });
});

describe('mapAllScenarioSchedules', () => {
  it('maps schedules for all scenarios', () => {
    const states = Object.values(HA_ENTITIES.scenarioParams).map((params) => ({
      entityId: params.scheduleConfig,
      state: serializeWeeklyScheduleJson(createUniformWeeklySchedule(false, '12:00', '12:00')),
      attributes: {},
    }));

    const schedules = mapAllScenarioSchedules(states);
    assert.equal(Object.keys(schedules).length, SCENARIO_DEFINITIONS.length);
    assert.equal(schedules.evening?.enabled, false);
    assert.equal(schedules.evening?.weekdays.mon.time, '12:00');
  });
});
