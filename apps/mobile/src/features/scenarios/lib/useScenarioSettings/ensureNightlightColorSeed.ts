import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import { getScenarioFieldEntityId } from '@/ha/mappers/mapScenarioSettings';
import {
  DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  parseScenarioLightColor,
  serializeScenarioLightColor,
} from '@/ha/mappers/scenarioLightColor';
import type { IHaEntityState } from '@/ha/types';

/** Ключ поля цвета ночника в scenario settings */
export const NIGHTLIGHT_COLOR_FIELD_KEY = 'nightlightColor';

/** Запись input_text для seed */
export type TWriteTextFn = (
  baseUrl: string,
  token: string,
  entityId: string,
  value: string,
) => Promise<void>;

/** Аргументы seed цвета ночника */
export interface IEnsureNightlightColorSeedArgs {
  /** id сценария */
  scenarioId: string;
  /** Base URL HA */
  haBaseUrl: string;
  /** Token HA */
  haToken: string;
  /** Текущие states */
  states: IHaEntityState[];
  /** Пресеты по ключу поля */
  colorPresetsByKey: Record<string, INightlightColorPreset[]>;
  /** Запись input_text */
  writeText: TWriteTextFn;
}

/**
 * Если helper цвета доступен, но пустой/битый — записывает дефолт
 * (первый пресет ночника или тёплый янтарный) и обновляет states.
 */
export async function ensureNightlightColorSeed(
  args: IEnsureNightlightColorSeedArgs,
): Promise<IHaEntityState[]> {
  const { scenarioId, haBaseUrl, haToken, states, colorPresetsByKey, writeText } = args;
  const colorEntityId = getScenarioFieldEntityId(scenarioId, NIGHTLIGHT_COLOR_FIELD_KEY);
  if (!colorEntityId) {
    return states;
  }

  const colorState = states.find((state) => state.entityId === colorEntityId);
  const colorAvailable =
    colorState !== undefined &&
    colorState.state !== 'unavailable' &&
    colorState.state !== 'unknown';
  if (!colorAvailable || parseScenarioLightColor(colorState.state)) {
    return states;
  }

  const seedColor: TLightColorValue =
    colorPresetsByKey[NIGHTLIGHT_COLOR_FIELD_KEY]?.[0]?.color ?? DEFAULT_SLEEP_NIGHTLIGHT_COLOR;
  const seedJson = serializeScenarioLightColor(seedColor);

  try {
    await writeText(haBaseUrl, haToken, colorEntityId, seedJson);
  } catch {
    // UI всё равно покажет дефолт через mapper fallback
    return states;
  }

  return states.map((state) => {
    if (state.entityId !== colorEntityId) return state;
    return { ...state, state: seedJson };
  });
}
