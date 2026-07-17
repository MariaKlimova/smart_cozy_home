import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { IScenarioSettings } from '@/domain/scenarioSettings.typings';
import {
  fetchHaLightFavoriteColors,
  type IHaLightColorPreset,
} from '@/ha/entityRegistry';
import { fetchEntityStates, setTextValue } from '@/ha/haClient';
import { mapHaLightPresetsToDomain } from '@/ha/mappers/lightColorMapper';
import { mapScenarioSettings } from '@/ha/mappers/mapScenarioSettings';
import type { IHaEntityState } from '@/ha/types';

import {
  NIGHTLIGHT_COLOR_FIELD_KEY,
  ensureNightlightColorSeed,
} from './ensureNightlightColorSeed';

/** Зависимости prepare (для тестов можно подменить) */
export interface IPrepareScenarioSettingsDeps {
  /** Читать states entity */
  fetchStates: (
    baseUrl: string,
    token: string,
    entityIds: string[],
  ) => Promise<IHaEntityState[]>;
  /** Читать избранные цвета лампы */
  fetchFavoriteColors: (
    baseUrl: string,
    token: string,
    entityId: string,
    lightAttributes?: Record<string, unknown>,
  ) => Promise<IHaLightColorPreset[]>;
  /** Записать input_text */
  writeText: (baseUrl: string, token: string, entityId: string, value: string) => Promise<void>;
}

const defaultDeps: IPrepareScenarioSettingsDeps = {
  fetchStates: fetchEntityStates,
  fetchFavoriteColors: fetchHaLightFavoriteColors,
  writeText: setTextValue,
};

/** Аргументы prepare настроек сценария */
export interface IPrepareScenarioSettingsArgs {
  /** id сценария */
  scenarioId: string;
  /** Base URL HA */
  haBaseUrl: string;
  /** Token HA */
  haToken: string;
  /** Entity_id helpers параметров сценария */
  scenarioParamEntityIds: string[];
  /** Entity_id ночника для пресетов; undefined если сценарий без цвета */
  nightlightEntityId: string | undefined;
  /** Дефолтное время расписания */
  defaultScheduleTime: string;
  /** Подмена HA-вызовов (тесты) */
  deps?: Partial<IPrepareScenarioSettingsDeps>;
}

/**
 * Читает HA, при необходимости сидирует цвет ночника, мапит в domain.
 * Порядок: fetch states → presets → seed → map.
 */
export async function prepareScenarioSettings(
  args: IPrepareScenarioSettingsArgs,
): Promise<IScenarioSettings> {
  const {
    scenarioId,
    haBaseUrl,
    haToken,
    scenarioParamEntityIds,
    nightlightEntityId,
    defaultScheduleTime,
    deps: depsOverride,
  } = args;
  const deps: IPrepareScenarioSettingsDeps = { ...defaultDeps, ...depsOverride };

  const fetchIds = nightlightEntityId
    ? [...scenarioParamEntityIds, nightlightEntityId]
    : scenarioParamEntityIds;
  let states = await deps.fetchStates(haBaseUrl, haToken, fetchIds);
  const colorPresetsByKey: Record<string, INightlightColorPreset[]> = {};

  if (nightlightEntityId) {
    const nightlightState = states.find((state) => state.entityId === nightlightEntityId);
    const haPresets = await deps.fetchFavoriteColors(
      haBaseUrl,
      haToken,
      nightlightEntityId,
      nightlightState?.attributes,
    );
    colorPresetsByKey[NIGHTLIGHT_COLOR_FIELD_KEY] = mapHaLightPresetsToDomain(haPresets);
  }

  states = await ensureNightlightColorSeed({
    scenarioId,
    haBaseUrl,
    haToken,
    states,
    colorPresetsByKey,
    writeText: deps.writeText,
  });

  return mapScenarioSettings(scenarioId, states, defaultScheduleTime, { colorPresetsByKey });
}
