import type { IBedroomSensorMapping } from '@/config/bedroomSensorMapping.typings';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  createUniformWeeklySchedule,
  serializeWeeklyScheduleJson,
} from '@/domain/scenarioWeeklySchedule';

/** JSON расписания для моков */
function mockScheduleState(enabled: boolean, time: string): string {
  return serializeWeeklyScheduleJson(createUniformWeeklySchedule(enabled, time, time));
}

export interface IMockEntitySnapshot {
  /** state string из HA */
  state: string;
  /** attributes entity */
  attributes?: Record<string, unknown>;
}

/** Дефолтные состояния устройств спальни для мок-режима */
export interface IScenarioDeviceMocks {
  /** entity_id → snapshot */
  [entityId: string]: IMockEntitySnapshot;
}

/** Дефолтные значения helpers сценариев для мок-режима */
export interface IScenarioParamMocks {
  /** entity_id → snapshot */
  [entityId: string]: IMockEntitySnapshot;
}

/** Дополнительные entities дома для карточки «Дом» и presence */
export interface IScenarioHomeMocks {
  /** entity_id → snapshot */
  [entityId: string]: IMockEntitySnapshot;
}

/** Все дефолтные моки для HA-контракта сценариев и спальни */
export interface IScenarioMocks {
  /** Состояния устройств спальни */
  devices: IScenarioDeviceMocks;
  /** Параметры сценариев и системные helpers */
  params: IScenarioParamMocks;
  /** Сущности дома вне контракта сценариев (presence, гостиная…) */
  home: IScenarioHomeMocks;
}

/**
 * Живая демо-сцена спальни: вечер, шторы наполовину, увлажнитель включён,
 * CO₂ чуть повышен — чтобы на «Сейчас» была осмысленная фраза и все контролы
 * на вкладке «Спальня» / в «Подкрутить» показывали разные состояния.
 */
export const SCENARIO_MOCKS: IScenarioMocks = {
  devices: {
    [HA_ENTITIES.devices.light]: {
      state: 'on',
      attributes: { brightness_pct: 35, color_temp: 320, brightness: 89 },
    },
    [HA_ENTITIES.devices.nightlight]: {
      state: 'off',
      attributes: { brightness_pct: 8, brightness: 20, rgb_color: [242, 145, 61] },
    },
    [HA_ENTITIES.devices.curtains]: {
      state: 'open',
      attributes: { current_position: 50, friendly_name: 'Шторы' },
    },
    [HA_ENTITIES.devices.window]: {
      state: 'closed',
      attributes: { current_position: 0, friendly_name: 'Окно' },
    },
    [HA_ENTITIES.devices.airConditioner]: {
      state: 'heat',
      attributes: { temperature: 21, current_temperature: 20.5, unit_of_measurement: '°C' },
    },
    [HA_ENTITIES.devices.ventilation]: {
      state: 'heat',
      attributes: { temperature: 20, current_temperature: 19.5, unit_of_measurement: '°C' },
    },
    [HA_ENTITIES.devices.radiator]: {
      state: 'heat',
      attributes: { temperature: 22, current_temperature: 21, unit_of_measurement: '°C' },
    },
    [HA_ENTITIES.devices.humidifier]: {
      state: 'on',
      attributes: { humidity: 42, mode: 'auto' },
    },
    [HA_ENTITIES.devices.humidifierFallback]: {
      state: 'unavailable',
      attributes: { friendly_name: 'Увлажнитель (розетка)' },
    },
    [HA_ENTITIES.devices.co2]: {
      state: '920',
      attributes: { unit_of_measurement: 'ppm', friendly_name: 'CO₂ спальня' },
    },
    [HA_ENTITIES.devices.temperature]: {
      state: '20.5',
      attributes: { unit_of_measurement: '°C', friendly_name: 'Температура спальня' },
    },
    [HA_ENTITIES.devices.humidity]: {
      state: '38',
      attributes: { unit_of_measurement: '%', friendly_name: 'Влажность спальня' },
    },
    [HA_ENTITIES.devices.pressure]: {
      state: '760',
      attributes: { unit_of_measurement: 'mmHg', friendly_name: 'Давление спальня' },
    },
    [HA_ENTITIES.devices.outdoorTemperature]: {
      state: 'cloudy',
      attributes: {
        temperature: 5,
        unit_of_measurement: '°C',
        friendly_name: 'На улице',
      },
    },
  },

  params: {
    [HA_ENTITIES.scenarioParams.evening.brightness]: { state: '15' },
    [HA_ENTITIES.scenarioParams.evening.temperature]: { state: '18' },
    [HA_ENTITIES.scenarioParams.evening.curtains]: { state: 'on' },
    [HA_ENTITIES.scenarioParams.evening.humidifier]: { state: 'on' },
    [HA_ENTITIES.scenarioParams.evening.scheduleConfig]: {
      state: mockScheduleState(false, '22:30'),
    },
    [HA_ENTITIES.scenarioParams.sleep.temperature]: { state: '17' },
    [HA_ENTITIES.scenarioParams.sleep.window]: { state: 'off' },
    [HA_ENTITIES.scenarioParams.sleep.nightlight]: { state: 'on' },
    [HA_ENTITIES.scenarioParams.sleep.nightlightBrightness]: { state: '8' },
    [HA_ENTITIES.scenarioParams.sleep.scheduleConfig]: {
      state: mockScheduleState(false, '23:00'),
    },
    [HA_ENTITIES.scenarioParams.morning.brightness]: { state: '80' },
    [HA_ENTITIES.scenarioParams.morning.warmupMinutes]: { state: '20' },
    [HA_ENTITIES.scenarioParams.morning.scheduleConfig]: {
      state: mockScheduleState(false, '07:00'),
    },
    [HA_ENTITIES.scenarioParams.away.temperature]: { state: '16' },
    [HA_ENTITIES.scenarioParams.away.curtains]: { state: 'on' },
    [HA_ENTITIES.scenarioParams.away.scheduleConfig]: {
      state: mockScheduleState(false, '08:00'),
    },
    [HA_ENTITIES.scenarioParams.comingHome.minutes]: { state: '20' },
    [HA_ENTITIES.scenarioParams.comingHome.temperature]: { state: '21' },
    [HA_ENTITIES.scenarioParams.comingHome.brightness]: { state: '60' },
    [HA_ENTITIES.scenarioParams.comingHome.scheduleConfig]: {
      state: mockScheduleState(false, '18:00'),
    },
    [HA_ENTITIES.scenarioParams.cozy.brightness]: { state: '40' },
    [HA_ENTITIES.scenarioParams.cozy.temperature]: { state: '21' },
    [HA_ENTITIES.scenarioParams.cozy.scheduleConfig]: {
      state: mockScheduleState(false, '20:00'),
    },
    [HA_ENTITIES.scenarioParams.focus.brightness]: { state: '90' },
    [HA_ENTITIES.scenarioParams.focus.temperature]: { state: '19' },
    [HA_ENTITIES.scenarioParams.focus.scheduleConfig]: {
      state: mockScheduleState(false, '09:00'),
    },
    [HA_ENTITIES.system.homeMode]: { state: 'none' },
    [HA_ENTITIES.system.homeReadyForArrival]: { state: 'off' },
  },

  home: {
    'person.maria': { state: 'home' },
    'person.partner': { state: 'not_home' },
    'sensor.living_room_temperature': {
      state: '22',
      attributes: { unit_of_measurement: '°C' },
    },
    'light.living_room': { state: 'on', attributes: { brightness: 180 } },
    'climate.living_room': {
      state: 'heat',
      attributes: { temperature: 22, current_temperature: 21.5, unit_of_measurement: '°C' },
    },
    'alarm_control_panel.home': { state: 'disarmed' },
    [HA_ENTITIES.devices.occupancy]: { state: 'off' },
    [HA_ENTITIES.system.sun]: {
      state: 'above_horizon',
      attributes: { friendly_name: 'Солнце' },
    },
  },
};

/** Авто-привязка датчиков в мок-режиме (без onboarding) */
export const MOCK_BEDROOM_SENSOR_MAPPING: IBedroomSensorMapping = {
  temperature: HA_ENTITIES.devices.temperature,
  humidity: HA_ENTITIES.devices.humidity,
  co2: HA_ENTITIES.devices.co2,
  pressure: HA_ENTITIES.devices.pressure,
};
