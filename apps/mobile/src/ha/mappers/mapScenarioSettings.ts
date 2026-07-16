import {
  HA_ENTITIES,
  SCENARIO_ID_TO_HA_ENTITY_KEY,
  type IScenarioHaParams,
  type TScenarioHaEntityKey,
  type TScenarioHaParamKey,
} from '@/config/scenarioHaMapping';
import { SCENARIO_DEFINITIONS } from '@/config/scenarios';
import { getScenarioFieldDefinitions } from '@/config/scenarioSettingsFields';
import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import { findNearestNightlightPresetId } from '@/domain/nightlightColorPresets';
import type {
  IScenarioScheduleState,
  IScenarioSettings,
} from '@/domain/scenarioSettings.typings';
import type { IScenarioWeeklySchedule } from '@/domain/scenarioWeeklySchedule.typings';
import {
  createDefaultWeeklySchedule,
  parseWeeklyScheduleJson,
} from '@/domain/scenarioWeeklySchedule';
import type { IHaEntityState } from '@/ha/types';
import {
  DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  DEFAULT_SLEEP_NIGHTLIGHT_DISPLAY_RGB,
  parseScenarioLightColor,
} from '@/ha/mappers/scenarioLightColor';

function resolveParamsKey(scenarioId: string): TScenarioHaEntityKey | undefined {
  return SCENARIO_ID_TO_HA_ENTITY_KEY[scenarioId];
}

const SCHEDULE_FIELD_KEY = 'scheduleConfig';

function getStateMap(states: IHaEntityState[]): Map<string, IHaEntityState> {
  return new Map(states.map((s) => [s.entityId, s]));
}

function isEntityAvailable(state: IHaEntityState | undefined): boolean {
  if (!state) return false;
  return state.state !== 'unavailable' && state.state !== 'unknown';
}

function readNumberState(
  stateMap: Map<string, IHaEntityState>,
  entityId: string,
  fallback: number,
): {
  value: number;
  isAvailable: boolean;
  min?: number;
  max?: number;
  step?: number;
} {
  const state = stateMap.get(entityId);
  if (!isEntityAvailable(state)) {
    return { value: fallback, isAvailable: false };
  }
  const value = Number.parseFloat(state!.state);
  const attrs = state!.attributes;
  const min = typeof attrs.min === 'number' ? attrs.min : undefined;
  const max = typeof attrs.max === 'number' ? attrs.max : undefined;
  const step = typeof attrs.step === 'number' ? attrs.step : undefined;
  if (Number.isNaN(value)) {
    return { value: fallback, isAvailable: true, min, max, step };
  }
  return { value, isAvailable: true, min, max, step };
}

function readBooleanState(
  stateMap: Map<string, IHaEntityState>,
  entityId: string,
  fallback: boolean,
): { value: boolean; isAvailable: boolean } {
  const state = stateMap.get(entityId);
  if (!isEntityAvailable(state)) {
    return { value: fallback, isAvailable: false };
  }
  return { value: state!.state === 'on', isAvailable: true };
}

function readColorState(
  stateMap: Map<string, IHaEntityState>,
  entityId: string,
): {
  color: TLightColorValue;
  displayRgb: [number, number, number];
  isAvailable: boolean;
} {
  const state = stateMap.get(entityId);
  if (!isEntityAvailable(state)) {
    return {
      color: DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
      displayRgb: DEFAULT_SLEEP_NIGHTLIGHT_DISPLAY_RGB,
      isAvailable: false,
    };
  }
  const parsed = parseScenarioLightColor(state!.state);
  if (!parsed) {
    return {
      color: DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
      displayRgb: DEFAULT_SLEEP_NIGHTLIGHT_DISPLAY_RGB,
      isAvailable: true,
    };
  }
  return { color: parsed.color, displayRgb: parsed.displayRgb, isAvailable: true };
}

/** entity_id helpers параметров сценария */
export function getScenarioParamEntityIds(scenarioId: string): string[] {
  const paramsKey = resolveParamsKey(scenarioId);
  if (!paramsKey) return [];
  const params = HA_ENTITIES.scenarioParams[paramsKey];
  return Object.values(params);
}

/** entity_id расписания всех сценариев */
export function collectScenarioScheduleEntityIds(): string[] {
  const ids: string[] = [];
  for (const definition of SCENARIO_DEFINITIONS) {
    const paramsKey = resolveParamsKey(definition.id);
    if (!paramsKey) continue;
    const params = HA_ENTITIES.scenarioParams[paramsKey];
    ids.push(params.scheduleConfig);
  }
  return ids;
}

function mapWeeklyScheduleFromStates(
  params: IScenarioHaParams,
  stateMap: Map<string, IHaEntityState>,
  defaultScheduleTime: string,
): IScenarioWeeklySchedule {
  const configState = stateMap.get(params.scheduleConfig);
  const configAvailable = isEntityAvailable(configState);
  const parsed = configAvailable
    ? parseWeeklyScheduleJson(configState!.state, defaultScheduleTime)
    : null;

  if (parsed) {
    return {
      ...parsed,
      isAvailable: true,
    };
  }

  return {
    ...createDefaultWeeklySchedule(defaultScheduleTime),
    isAvailable: false,
  };
}

/** entity_id поля настроек */
export function getScenarioFieldEntityId(
  scenarioId: string,
  fieldKey: string,
): string | undefined {
  const paramsKey = resolveParamsKey(scenarioId);
  if (!paramsKey) return undefined;
  const params = HA_ENTITIES.scenarioParams[paramsKey];
  return params[fieldKey as TScenarioHaParamKey];
}

/** Опции маппинга настроек сценария */
export interface IMapScenarioSettingsOptions {
  /** Пресеты цвета по ключу поля (например nightlightColor) */
  colorPresetsByKey?: Record<string, INightlightColorPreset[]>;
}

/** Маппинг HA states → настройки сценария */
export function mapScenarioSettings(
  scenarioId: string,
  states: IHaEntityState[],
  defaultScheduleTime: string,
  options?: IMapScenarioSettingsOptions,
): IScenarioSettings {
  const stateMap = getStateMap(states);
  const paramsKey = resolveParamsKey(scenarioId);
  const missingFieldKeys: string[] = [];
  const fieldDefs = getScenarioFieldDefinitions(scenarioId);
  const colorPresetsByKey = options?.colorPresetsByKey ?? {};

  const numbers = fieldDefs
    .filter((f) => f.kind === 'number')
    .map((field) => {
      const entityId = getScenarioFieldEntityId(scenarioId, field.key);
      if (!entityId) {
        missingFieldKeys.push(field.key);
        return {
          key: field.key,
          value: field.min ?? 0,
          min: field.min ?? 0,
          max: field.max ?? 100,
          step: field.step ?? 1,
          unit: field.unit,
          isAvailable: false,
        };
      }
      const { value, isAvailable, min, max, step } = readNumberState(
        stateMap,
        entityId,
        field.min ?? 0,
      );
      if (!isAvailable) missingFieldKeys.push(field.key);
      return {
        key: field.key,
        value,
        min: min ?? field.min ?? 0,
        max: max ?? field.max ?? 100,
        step: step ?? field.step ?? 1,
        unit: field.unit,
        isAvailable,
      };
    });

  const booleans = fieldDefs
    .filter((f) => f.kind === 'boolean')
    .map((field) => {
      const entityId = getScenarioFieldEntityId(scenarioId, field.key);
      if (!entityId) {
        missingFieldKeys.push(field.key);
        return { key: field.key, value: false, isAvailable: false };
      }
      const { value, isAvailable } = readBooleanState(stateMap, entityId, false);
      if (!isAvailable) missingFieldKeys.push(field.key);
      return { key: field.key, value, isAvailable };
    });

  const colors = fieldDefs
    .filter((f) => f.kind === 'color')
    .map((field) => {
      const entityId = getScenarioFieldEntityId(scenarioId, field.key);
      const colorPresets = colorPresetsByKey[field.key] ?? [];
      if (!entityId) {
        missingFieldKeys.push(field.key);
        return {
          key: field.key,
          color: DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
          colorPresetId: findNearestNightlightPresetId(
            DEFAULT_SLEEP_NIGHTLIGHT_DISPLAY_RGB,
            colorPresets,
          ),
          colorPresets,
          isAvailable: false,
        };
      }
      const { color, displayRgb, isAvailable } = readColorState(stateMap, entityId);
      if (!isAvailable) missingFieldKeys.push(field.key);
      return {
        key: field.key,
        color,
        colorPresetId: findNearestNightlightPresetId(displayRgb, colorPresets),
        colorPresets,
        isAvailable,
      };
    });

  let schedule: IScenarioWeeklySchedule = {
    ...createDefaultWeeklySchedule(defaultScheduleTime),
    isAvailable: false,
  };

  if (paramsKey) {
    const params = HA_ENTITIES.scenarioParams[paramsKey];
    schedule = mapWeeklyScheduleFromStates(params, stateMap, defaultScheduleTime);

    if (!schedule.isAvailable) {
      missingFieldKeys.push(SCHEDULE_FIELD_KEY);
    }
  }

  return {
    scenarioId,
    numbers,
    booleans,
    colors,
    schedule,
    missingFieldKeys,
  };
}

/** Расписание всех сценариев из states */
export function mapAllScenarioSchedules(
  states: IHaEntityState[],
): Record<string, IScenarioScheduleState> {
  const stateMap = getStateMap(states);
  const result: Record<string, IScenarioScheduleState> = {};

  for (const definition of SCENARIO_DEFINITIONS) {
    const paramsKey = resolveParamsKey(definition.id);
    if (!paramsKey) continue;

    const params = HA_ENTITIES.scenarioParams[paramsKey];
    const fallbackTime = definition.defaultScheduleTime ?? '22:00';
    const weekly = mapWeeklyScheduleFromStates(params, stateMap, fallbackTime);

    result[definition.id] = {
      enabled: weekly.enabled,
      weekdays: weekly.weekdays,
    };
  }

  return result;
}
