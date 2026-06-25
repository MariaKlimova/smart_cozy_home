/**
 * Typed mapping (зеркало config/home.default.yaml).
 * При изменении YAML обновите и этот файл.
 *
 * TODO(SH-21): скрипт sync home.default.yaml → HOME_CONFIG (check + write), YAML — source of truth.
 * https://klimovamaria5227.atlassian.net/browse/SH-21
 */

import type { IHomeConfig } from './homeConfig.typings';

export type {
  IBedroomDeviceMapping,
  IBedroomDevicesMapping,
  IBedroomSensorsMapping,
  IHomeConfig,
} from './homeConfig.typings';

export const HOME_CONFIG: IHomeConfig = {
  rituals: {
    evening: { label: 'Вечер', script: 'script.ritual_evening', icon: 'moon-o' },
    sleep: { label: 'Сон', script: 'script.ritual_sleep', icon: 'bed' },
    focus: { label: 'Фокус', script: 'script.ritual_focus', icon: 'laptop' },
    cozy: { label: 'Уют', script: 'script.ritual_cozy', icon: 'coffee' },
    away: { label: 'Уехали', script: 'script.ritual_away', icon: 'sign-out' },
  },
  bedroom_sensors: {
    co2: { entity: 'sensor.bedroom_co2' },
    temperature: { entity: 'sensor.bedroom_temperature' },
    humidity: { entity: 'sensor.bedroom_humidity' },
  },
  bedroom_devices: {
    devices: [
      {
        id: 'light',
        label: 'Свет',
        control: 'slider',
        entity: 'light.bedroom',
        slider: { min: 0, max: 100, step: 1 },
      },
      {
        id: 'climate',
        label: 'Температура',
        control: 'slider',
        entity: 'climate.bedroom',
        slider: { min: 16, max: 28, step: 0.5 },
      },
      {
        id: 'curtains',
        label: 'Шторы',
        control: 'segmented',
        entity: 'cover.bedroom_curtains',
        segments: [
          { id: 'open', label: 'Открыты', value: 100 },
          { id: 'half', label: 'Наполовину', value: 50 },
          { id: 'closed', label: 'Закрыты', value: 0 },
        ],
      },
      {
        id: 'humidifier',
        label: 'Увлажнитель',
        control: 'toggle',
        entity: 'humidifier.bedroom',
      },
      {
        id: 'window',
        label: 'Окно',
        control: 'segmented',
        entity: 'cover.bedroom_window',
        segments: [
          { id: 'open', label: 'Открыть', value: 100 },
          { id: 'closed', label: 'Закрыть', value: 0 },
        ],
      },
    ],
  },
  home_state: {
    temperature: { entity: 'sensor.living_room_temperature' },
    light_summary: { entities: ['light.living_room', 'light.bedroom'] },
    security: { entity: 'alarm_control_panel.home' },
  },
  rooms: [
    {
      id: 'living_room',
      label: 'Гостиная',
      area_id: 'living_room',
      light: 'light.living_room',
      climate: 'climate.living_room',
    },
    {
      id: 'bedroom',
      label: 'Спальня',
      area_id: 'bedroom',
      light: 'light.bedroom',
    },
  ],
  presence: {
    persons: [
      { entity: 'person.maria', label: 'Мария' },
      { entity: 'person.partner', label: 'Партнёр' },
    ],
  },
  timeline: {
    entity_watch: ['person.maria', 'input_select.home_mode'],
  },
  gentle_notifications: [
    {
      id: 'bedroom_dark',
      room_id: 'bedroom',
      light_entity: 'light.bedroom',
      occupancy_entity: 'binary_sensor.bedroom_occupancy',
      message: 'Похоже, в спальне темно — включить свет?',
    },
  ],
};

export function loadHomeConfig(): IHomeConfig {
  return HOME_CONFIG;
}
