/**
 * Typed mapping (зеркало config/home.default.yaml).
 * При изменении YAML обновите и этот файл.
 *
 * HA-контракт сценариев: docs/scenarios-ha-contract.md, config/scenarioHaMapping.ts
 * Инсталляционный пакет: SH-24 (packages/ha-installer/)
 *
 * TODO(SH-21): скрипт sync home.default.yaml → HOME_CONFIG (check + write), YAML — source of truth.
 * https://klimovamaria5227.atlassian.net/browse/SH-21
 */

import { HA_ENTITIES } from '@/config/scenarioHaMapping';

import type { IHomeConfig } from './homeConfig.typings';

export type {
  IBedroomDeviceMapping,
  IBedroomDevicesMapping,
  IBedroomSensorsMapping,
  IHomeConfig,
  IScenariosHaMapping,
} from './homeConfig.typings';

export const HOME_CONFIG: IHomeConfig = {
  bedroom_sensors: {
    co2: { entity: HA_ENTITIES.devices.co2 },
    temperature: { entity: HA_ENTITIES.devices.temperature },
    humidity: { entity: HA_ENTITIES.devices.humidity },
    pressure: { entity: HA_ENTITIES.devices.pressure },
  },
  bedroom_devices: {
    devices: [
      {
        id: 'light',
        label: 'Свет',
        control: 'slider',
        entity: HA_ENTITIES.devices.light,
        slider: { min: 0, max: 100, step: 1 },
      },
      {
        id: 'air_conditioner',
        label: 'Кондиционер',
        control: 'slider',
        entity: HA_ENTITIES.devices.airConditioner,
        slider: { min: 16, max: 30, step: 0.5 },
      },
      {
        id: 'ventilation',
        label: 'Приточка',
        control: 'slider',
        entity: HA_ENTITIES.devices.ventilation,
        slider: { min: 16, max: 28, step: 0.5 },
      },
      {
        id: 'radiator',
        label: 'Радиатор',
        control: 'slider',
        entity: HA_ENTITIES.devices.radiator,
        slider: { min: 16, max: 28, step: 0.5 },
      },
      {
        id: 'curtains',
        label: 'Шторы',
        control: 'segmented',
        entity: HA_ENTITIES.devices.curtains,
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
        entity: HA_ENTITIES.devices.humidifier,
      },
      {
        id: 'window',
        label: 'Окно',
        control: 'segmented',
        entity: HA_ENTITIES.devices.window,
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
      light: HA_ENTITIES.devices.light,
    },
  ],
  presence: {
    persons: [
      { entity: 'person.maria', label: 'Мария' },
      { entity: 'person.partner', label: 'Партнёр' },
    ],
  },
  timeline: {
    entity_watch: ['person.maria', HA_ENTITIES.system.homeMode],
  },
  gentle_notifications: [
    {
      id: 'bedroom_dark',
      room_id: 'bedroom',
      light_entity: HA_ENTITIES.devices.light,
      occupancy_entity: 'binary_sensor.bedroom_occupancy',
      message: 'Похоже, в спальне темно — включить свет?',
    },
  ],
  scenarios_ha: {
    home_mode: { entity: HA_ENTITIES.system.homeMode },
    prepared: { entity: HA_ENTITIES.system.homeReadyForArrival },
    exit_home_mode_option: 'none',
  },
};

export function loadHomeConfig(): IHomeConfig {
  return HOME_CONFIG;
}
