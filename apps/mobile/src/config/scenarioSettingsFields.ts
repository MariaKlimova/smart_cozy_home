import { copy } from '@/copy/ru';

/** Тип поля настроек сценария */
export type TScenarioFieldKind = 'number' | 'boolean' | 'color' | 'text';

const MINUTES_UNIT = copy.units.minutesShort;

/** Описание одного поля настроек */
export interface IScenarioFieldDefinition {
  /** Ключ поля в domain и HA mapping */
  key: string;
  /** Тип контрола */
  kind: TScenarioFieldKind;
  /** Ключ в copy.scenarios.settingsFields */
  copyKey: string;
  /**
   * Ключ родительского boolean-поля: при `false` это поле скрыто в UI
   * (например яркость/цвет ночника зависят от `nightlight`)
   */
  dependsOnKey?: string;
  /** Минимум для number */
  min?: number;
  /** Максимум для number */
  max?: number;
  /** Шаг для number */
  step?: number;
  /** Единица для number */
  unit?: string;
  /** Максимальная длина для text (лимит HA input_text) */
  maxLength?: number;
  /** Ключ подсказки в copy.scenarios.settingsFields (text) */
  hintCopyKey?: string;
  /** Ключ placeholder в copy.scenarios.settingsFields (text) */
  placeholderCopyKey?: string;
}

/** Общее text-поле плейлиста (SH-58) */
const PLAYLIST_FIELD: IScenarioFieldDefinition = {
  key: 'playlist',
  kind: 'text',
  copyKey: 'playlist',
  maxLength: 255,
  hintCopyKey: 'playlistHint',
  placeholderCopyKey: 'playlistPlaceholder',
};

/** Поля параметров по id сценария (без расписания) */
export const SCENARIO_FIELD_DEFINITIONS: Record<string, IScenarioFieldDefinition[]> = {
  evening: [
    { key: 'brightness', kind: 'number', copyKey: 'brightness', min: 1, max: 100, step: 1, unit: '%' },
    { key: 'temperature', kind: 'number', copyKey: 'temperature', min: 15, max: 25, step: 0.5, unit: '°C' },
    { key: 'curtains', kind: 'boolean', copyKey: 'curtains' },
    { key: 'humidifier', kind: 'boolean', copyKey: 'humidifier' },
    PLAYLIST_FIELD,
  ],
  sleep: [
    { key: 'temperature', kind: 'number', copyKey: 'nightTemperature', min: 15, max: 22, step: 0.5, unit: '°C' },
    { key: 'window', kind: 'boolean', copyKey: 'window' },
    { key: 'nightlight', kind: 'boolean', copyKey: 'nightlight' },
    {
      key: 'nightlightBrightness',
      kind: 'number',
      copyKey: 'nightlightBrightness',
      dependsOnKey: 'nightlight',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
    },
    {
      key: 'nightlightColor',
      kind: 'color',
      copyKey: 'nightlightColor',
      dependsOnKey: 'nightlight',
    },
    PLAYLIST_FIELD,
  ],
  morning: [
    { key: 'brightness', kind: 'number', copyKey: 'brightness', min: 1, max: 100, step: 1, unit: '%' },
    { key: 'warmupMinutes', kind: 'number', copyKey: 'warmupMinutes', min: 5, max: 60, step: 5, unit: MINUTES_UNIT },
    PLAYLIST_FIELD,
  ],
  away: [
    { key: 'temperature', kind: 'number', copyKey: 'awayTemperature', min: 12, max: 20, step: 0.5, unit: '°C' },
    { key: 'curtains', kind: 'boolean', copyKey: 'curtains' },
  ],
  coming_home: [
    { key: 'minutes', kind: 'number', copyKey: 'minutes', min: 5, max: 120, step: 5, unit: MINUTES_UNIT },
    { key: 'temperature', kind: 'number', copyKey: 'temperature', min: 18, max: 26, step: 0.5, unit: '°C' },
    { key: 'brightness', kind: 'number', copyKey: 'brightness', min: 1, max: 100, step: 1, unit: '%' },
  ],
  cozy: [
    { key: 'brightness', kind: 'number', copyKey: 'brightness', min: 1, max: 100, step: 1, unit: '%' },
    { key: 'temperature', kind: 'number', copyKey: 'temperature', min: 18, max: 26, step: 0.5, unit: '°C' },
    PLAYLIST_FIELD,
  ],
  focus: [
    { key: 'brightness', kind: 'number', copyKey: 'brightness', min: 1, max: 100, step: 1, unit: '%' },
    { key: 'temperature', kind: 'number', copyKey: 'temperature', min: 18, max: 24, step: 0.5, unit: '°C' },
    PLAYLIST_FIELD,
  ],
};

/** Поля параметров для сценария */
export function getScenarioFieldDefinitions(scenarioId: string): IScenarioFieldDefinition[] {
  return SCENARIO_FIELD_DEFINITIONS[scenarioId] ?? [];
}
