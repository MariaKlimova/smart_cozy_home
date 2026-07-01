import {
  HA_ENTITIES,
  type IHaScenarioParamEntities,
} from '@/config/scenarioHaMapping';
import { SCENARIO_DEFINITIONS } from '@/config/scenarios';
import { getScenarioFieldDefinitions } from '@/config/scenarioSettingsFields';
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

/** Маппинг id сценария → ключ в HA_ENTITIES.scenarioParams */
const SCENARIO_ID_TO_PARAMS_KEY: Record<string, keyof IHaScenarioParamEntities> = {
  evening: 'evening',
  sleep: 'sleep',
  morning: 'morning',
  away: 'away',
  coming_home: 'comingHome',
  cozy: 'cozy',
  focus: 'focus',
};

const SCHEDULE_FIELD_KEY = 'scheduleConfig';

function resolveParamsKey(scenarioId: string): keyof IHaScenarioParamEntities | undefined {
  return SCENARIO_ID_TO_PARAMS_KEY[scenarioId];
}

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
): { value: number; isAvailable: boolean } {
  const state = stateMap.get(entityId);
  if (!isEntityAvailable(state)) {
    return { value: fallback, isAvailable: false };
  }
  const value = Number.parseFloat(state!.state);
  if (Number.isNaN(value)) {
    return { value: fallback, isAvailable: true };
  }
  return { value, isAvailable: true };
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
  params: (typeof HA_ENTITIES.scenarioParams)[keyof typeof HA_ENTITIES.scenarioParams],
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
  const params = HA_ENTITIES.scenarioParams[paramsKey] as unknown as Record<string, string>;
  return params[fieldKey];
}

/** Маппинг HA states → настройки сценария */
export function mapScenarioSettings(
  scenarioId: string,
  states: IHaEntityState[],
  defaultScheduleTime: string,
): IScenarioSettings {
  const stateMap = getStateMap(states);
  const paramsKey = resolveParamsKey(scenarioId);
  const missingFieldKeys: string[] = [];
  const fieldDefs = getScenarioFieldDefinitions(scenarioId);

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
      const { value, isAvailable } = readNumberState(stateMap, entityId, field.min ?? 0);
      if (!isAvailable) missingFieldKeys.push(field.key);
      return {
        key: field.key,
        value,
        min: field.min ?? 0,
        max: field.max ?? 100,
        step: field.step ?? 1,
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
