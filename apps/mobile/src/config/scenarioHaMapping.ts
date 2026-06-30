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
  /** Температура на улице (template из weather.home) */
  outdoorTemperature: string;
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

/** Scripts сценариев */
export interface IHaScriptEntities {
  /** script.evening */
  evening: string;
  /** script.sleep */
  sleep: string;
  /** script.morning */
  morning: string;
  /** script.away */
  away: string;
  /** script.coming_home */
  comingHome: string;
  /** script.cozy */
  cozy: string;
  /** script.focus */
  focus: string;
}

/** Параметры сценария «Вечер» */
export interface IEveningScenarioParams {
  /** Яркость, % */
  brightness: string;
  /** Температура, °C */
  temperature: string;
  /** Закрывать шторы */
  curtains: string;
  /** Включать увлажнитель */
  humidifier: string;
  /** Расписание включено */
  scheduleEnabled: string;
  /** Время расписания */
  scheduleTime: string;
}

/** Параметры сценария «Сон» */
export interface ISleepScenarioParams {
  /** Ночная температура */
  temperature: string;
  /** Открывать окно */
  window: string;
  /** Расписание включено */
  scheduleEnabled: string;
  /** Время расписания */
  scheduleTime: string;
}

/** Параметры сценария «Утро» */
export interface IMorningScenarioParams {
  /** Яркость */
  brightness: string;
  /** Минуты плавного пробуждения */
  warmupMinutes: string;
  /** Расписание включено */
  scheduleEnabled: string;
  /** Время расписания */
  scheduleTime: string;
}

/** Параметры сценария «Уехали» */
export interface IAwayScenarioParams {
  /** Температура при отъезде */
  temperature: string;
  /** Закрывать шторы */
  curtains: string;
}

/** Параметры сценария «Еду домой» */
export interface IComingHomeScenarioParams {
  /** За сколько минут нажать */
  minutes: string;
  /** Температура встречи */
  temperature: string;
  /** Яркость встречи */
  brightness: string;
}

/** Параметры сценария «Уют» */
export interface ICozyScenarioParams {
  /** Яркость */
  brightness: string;
  /** Температура */
  temperature: string;
}

/** Параметры сценария «Фокус» */
export interface IFocusScenarioParams {
  /** Яркость */
  brightness: string;
  /** Температура */
  temperature: string;
}

/** Helpers параметров всех сценариев */
export interface IHaScenarioParamEntities {
  /** Вечер */
  evening: IEveningScenarioParams;
  /** Сон */
  sleep: ISleepScenarioParams;
  /** Утро */
  morning: IMorningScenarioParams;
  /** Уехали */
  away: IAwayScenarioParams;
  /** Еду домой */
  comingHome: IComingHomeScenarioParams;
  /** Уют */
  cozy: ICozyScenarioParams;
  /** Фокус */
  focus: IFocusScenarioParams;
}

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
    outdoorTemperature: 'sensor.outdoor_temperature',
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
      scheduleEnabled: 'input_boolean.evening_schedule_enabled',
      scheduleTime: 'input_datetime.evening_schedule_time',
    },
    sleep: {
      temperature: 'input_number.sleep_temperature',
      window: 'input_boolean.sleep_window',
      scheduleEnabled: 'input_boolean.sleep_schedule_enabled',
      scheduleTime: 'input_datetime.sleep_schedule_time',
    },
    morning: {
      brightness: 'input_number.morning_brightness',
      warmupMinutes: 'input_number.morning_warmup_minutes',
      scheduleEnabled: 'input_boolean.morning_schedule_enabled',
      scheduleTime: 'input_datetime.morning_schedule_time',
    },
    away: {
      temperature: 'input_number.away_temperature',
      curtains: 'input_boolean.away_curtains',
    },
    comingHome: {
      minutes: 'input_number.coming_home_minutes',
      temperature: 'input_number.coming_home_temperature',
      brightness: 'input_number.coming_home_brightness',
    },
    cozy: {
      brightness: 'input_number.cozy_brightness',
      temperature: 'input_number.cozy_temperature',
    },
    focus: {
      brightness: 'input_number.focus_brightness',
      temperature: 'input_number.focus_temperature',
    },
  },
} as const;
