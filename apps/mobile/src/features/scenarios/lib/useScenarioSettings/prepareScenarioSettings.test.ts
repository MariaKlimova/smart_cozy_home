import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { ensureNightlightColorSeed } from '@/features/scenarios/lib/useScenarioSettings/ensureNightlightColorSeed';
import { prepareScenarioSettings } from '@/features/scenarios/lib/useScenarioSettings/prepareScenarioSettings';
import {
  DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  serializeScenarioLightColor,
} from '@/ha/mappers/scenarioLightColor';
import type { IHaEntityState } from '@/ha/types';

const sleepParams = HA_ENTITIES.scenarioParams.sleep;

function haState(entityId: string, state: string): IHaEntityState {
  return { entityId, state, attributes: {} };
}

describe('ensureNightlightColorSeed', () => {
  it('writes default color when helper is empty', async () => {
    const writes: { entityId: string; value: string }[] = [];
    const states = [
      haState(sleepParams.nightlightColor, ''),
      haState(sleepParams.temperature, '17'),
    ];

    const next = await ensureNightlightColorSeed({
      scenarioId: 'sleep',
      haBaseUrl: 'http://ha',
      haToken: 'token',
      states,
      colorPresetsByKey: {},
      writeText: async (_base, _token, entityId, value) => {
        writes.push({ entityId, value });
      },
    });

    assert.equal(writes.length, 1);
    assert.equal(writes[0]?.entityId, sleepParams.nightlightColor);
    assert.equal(writes[0]?.value, serializeScenarioLightColor(DEFAULT_SLEEP_NIGHTLIGHT_COLOR));
    assert.equal(
      next.find((s) => s.entityId === sleepParams.nightlightColor)?.state,
      serializeScenarioLightColor(DEFAULT_SLEEP_NIGHTLIGHT_COLOR),
    );
  });

  it('seeds first preset color when presets are provided', async () => {
    const writes: string[] = [];
    const presetColor = { kind: 'rgb' as const, rgb: [134, 168, 249] as [number, number, number] };

    await ensureNightlightColorSeed({
      scenarioId: 'sleep',
      haBaseUrl: 'http://ha',
      haToken: 'token',
      states: [haState(sleepParams.nightlightColor, '{}')],
      colorPresetsByKey: {
        nightlightColor: [
          {
            id: 'color-0',
            displayRgb: [134, 168, 249],
            color: presetColor,
          },
        ],
      },
      writeText: async (_base, _token, _entityId, value) => {
        writes.push(value);
      },
    });

    assert.equal(writes[0], serializeScenarioLightColor(presetColor));
  });

  it('does not write when color is already valid', async () => {
    let writeCount = 0;
    const valid = serializeScenarioLightColor(DEFAULT_SLEEP_NIGHTLIGHT_COLOR);
    const states = [haState(sleepParams.nightlightColor, valid)];

    const next = await ensureNightlightColorSeed({
      scenarioId: 'sleep',
      haBaseUrl: 'http://ha',
      haToken: 'token',
      states,
      colorPresetsByKey: {},
      writeText: async () => {
        writeCount += 1;
      },
    });

    assert.equal(writeCount, 0);
    assert.equal(next, states);
  });
});

describe('prepareScenarioSettings', () => {
  it('maps sleep settings and seeds empty nightlight color', async () => {
    const writes: string[] = [];
    const settings = await prepareScenarioSettings({
      scenarioId: 'sleep',
      haBaseUrl: 'http://ha',
      haToken: 'token',
      scenarioParamEntityIds: Object.values(sleepParams),
      nightlightEntityId: HA_ENTITIES.devices.nightlight,
      defaultScheduleTime: '23:00',
      deps: {
        fetchStates: async () => [
          haState(sleepParams.temperature, '17'),
          haState(sleepParams.window, 'off'),
          haState(sleepParams.nightlight, 'on'),
          haState(sleepParams.nightlightBrightness, '8'),
          haState(sleepParams.nightlightColor, ''),
          haState(sleepParams.scheduleConfig, '{"version":1,"enabled":false,"weekdays":{"mon":[false,"23:00"],"tue":[false,"23:00"],"wed":[false,"23:00"],"thu":[false,"23:00"],"fri":[false,"23:00"],"sat":[false,"23:00"],"sun":[false,"23:00"]}}'),
          haState(HA_ENTITIES.devices.nightlight, 'off'),
        ],
        fetchFavoriteColors: async () => [{ rgb: [242, 145, 61], payload: { rgb_color: [242, 145, 61] } }],
        writeText: async (_base, _token, _entityId, value) => {
          writes.push(value);
        },
      },
    });

    assert.equal(writes.length, 1);
    assert.equal(settings.colors.length, 1);
    assert.equal(settings.colors[0]?.colorPresetId, 'color-0');
    assert.equal(settings.colors[0]?.isAvailable, true);
  });
});
