/**
 * Единственный источник entity_id для сценариев и спальни (SH-27).
 * Контракт: docs/scenarios-ha-contract.md, packages/ha-installer/DEVICES.md
 */

/** Entity_id устройств спальни */
export interface IHaBedroomDeviceEntities {
  /** Основной свет */
  light: string;
  /** Шторы */
  curtains: string;
  /** Открыватель окна */
  window: string;
  /** Кондиционер */
  airConditioner: string;
  /** Приточная вентиляция */
  ventilation: string;
  /** Радиатор */
  radiator: string;
  /** Увлажнитель */
  humidifier: string;
  /** Датчик CO₂ */
  co2: string;
  /** Датчик температуры */
  temperature: string;
  /** Датчик влажности */
  humidity: string;
  /** Температура на улице */
  outdoorTemperature: string;
  /** Датчик присутствия в спальне */
  occupancy: string;
}

/** Системные helpers HA */
export interface IHaSystemEntities {
  /** input_select.home_mode — активный режим */
  homeMode: string;
  /** input_boolean.home_ready_for_arrival */
  homeReadyForArrival: string;
  /** sun.sun — UI «Снаружи»: ближайший next_rising или next_setting (см. parseSunEvent.ts) */
  sun: string;
}

/** Ключ сценария в HA_ENTITIES.scripts и .scenarioParams */
export type TScenarioHaEntityKey =
  | 'evening'
  | 'sleep'
  | 'morning'
  | 'away'
  | 'comingHome'
  | 'cozy'
  | 'focus';

/** id сценария в приложении → ключ в HA_ENTITIES */
export const SCENARIO_ID_TO_HA_ENTITY_KEY: Record<string, TScenarioHaEntityKey> = {
  evening: 'evening',
  sleep: 'sleep',
  morning: 'morning',
  away: 'away',
  coming_home: 'comingHome',
  cozy: 'cozy',
  focus: 'focus',
};

/** Scripts сценариев */
export type IHaScriptEntities = Record<TScenarioHaEntityKey, string>;

/** Ключи helpers параметров сценария в HA */
export type TScenarioHaParamKey =
  | 'brightness'
  | 'temperature'
  | 'curtains'
  | 'humidifier'
  | 'window'
  | 'warmupMinutes'
  | 'minutes'
  | 'scheduleConfig';

/**
 * Entity_id helpers одного сценария.
 * У каждого сценария свой поднабор ключей из {@link TScenarioHaParamKey}.
 */
export interface IScenarioHaParams {
  /** JSON расписание по дням недели */
  scheduleConfig: string;
  /** Entity_id остальных helpers сценария */
  [paramKey: string]: string;
}

/** Helpers параметров всех сценариев */
export type IHaScenarioParamEntities = Record<TScenarioHaEntityKey, IScenarioHaParams>;

/** Полный контракт entity_id HA ↔ приложение */
export interface IHaEntities {
  /** Устройства спальни */
  devices: IHaBedroomDeviceEntities;
  /** Системные helpers */
  system: IHaSystemEntities;
  /** Scripts сценариев */
  scripts: IHaScriptEntities;
  /** Параметры сценариев */
  scenarioParams: IHaScenarioParamEntities;
}

/** Entity_id для сценариев и спальни — единственное место хардкода id */
export const HA_ENTITIES: IHaEntities = {
  devices: {
    light: 'light.bedroom',
    curtains: 'cover.bedroom_curtains',
    window: 'cover.bedroom_window',
    airConditioner: 'climate.bedroom_ac',
    ventilation: 'climate.bedroom_ventilation',
    radiator: 'climate.bedroom_radiator',
    humidifier: 'humidifier.bedroom',
    co2: 'sensor.bedroom_co2',
    temperature: 'sensor.bedroom_temperature',
    humidity: 'sensor.bedroom_humidity',
    outdoorTemperature: 'weather.forecast_home_assistant',
    occupancy: 'binary_sensor.bedroom_occupancy',
  },

  system: {
    homeMode: 'input_select.home_mode',
    homeReadyForArrival: 'input_boolean.home_ready_for_arrival',
    sun: 'sun.sun',
  },

  scripts: {
    evening: 'script.evening',
    sleep: 'script.sleep',
    morning: 'script.morning',
    away: 'script.away',
    comingHome: 'script.coming_home',
    cozy: 'script.cozy',
    focus: 'script.focus',
  },

  scenarioParams: {
    evening: {
      brightness: 'input_number.evening_brightness',
      temperature: 'input_number.evening_temperature',
      curtains: 'input_boolean.evening_curtains',
      humidifier: 'input_boolean.evening_humidifier',
      scheduleConfig: 'input_text.evening_schedule',
    },
    sleep: {
      temperature: 'input_number.sleep_temperature',
      window: 'input_boolean.sleep_window',
      scheduleConfig: 'input_text.sleep_schedule',
    },
    morning: {
      brightness: 'input_number.morning_brightness',
      warmupMinutes: 'input_number.morning_warmup_minutes',
      scheduleConfig: 'input_text.morning_schedule',
    },
    away: {
      temperature: 'input_number.away_temperature',
      curtains: 'input_boolean.away_curtains',
      scheduleConfig: 'input_text.away_schedule',
    },
    comingHome: {
      minutes: 'input_number.coming_home_minutes',
      temperature: 'input_number.coming_home_temperature',
      brightness: 'input_number.coming_home_brightness',
      scheduleConfig: 'input_text.coming_home_schedule',
    },
    cozy: {
      brightness: 'input_number.cozy_brightness',
      temperature: 'input_number.cozy_temperature',
      scheduleConfig: 'input_text.cozy_schedule',
    },
    focus: {
      brightness: 'input_number.focus_brightness',
      temperature: 'input_number.focus_temperature',
      scheduleConfig: 'input_text.focus_schedule',
    },
  },
} as const;
