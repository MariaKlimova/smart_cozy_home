/**
 * Typed mapping (зеркало config/rituals.default.yaml).
 * При изменении YAML обновите и этот файл.
 */

export interface IRitualMapping {
  label: string;
  script: string;
  icon: string;
}

export interface IRoomMapping {
  id: string;
  label: string;
  area_id: string;
  light: string;
  climate?: string;
}

export interface IRitualsConfig {
  rituals: Record<string, IRitualMapping>;
  home_state: {
    temperature: { entity: string };
    light_summary: { entities: string[] };
    security: { entity: string };
  };
  rooms: IRoomMapping[];
  presence: {
    persons: Array<{ entity: string; label: string }>;
  };
  timeline: {
    entity_watch: string[];
  };
  gentle_notifications: Array<{
    id: string;
    room_id: string;
    light_entity: string;
    occupancy_entity: string;
    message: string;
  }>;
}

export const RITUALS_CONFIG: IRitualsConfig = {
  rituals: {
    evening: { label: 'Вечер', script: 'script.ritual_evening', icon: 'moon-o' },
    sleep: { label: 'Сон', script: 'script.ritual_sleep', icon: 'bed' },
    focus: { label: 'Фокус', script: 'script.ritual_focus', icon: 'laptop' },
    cozy: { label: 'Уют', script: 'script.ritual_cozy', icon: 'coffee' },
    away: { label: 'Уехали', script: 'script.ritual_away', icon: 'sign-out' },
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

export function loadRitualsConfig(): IRitualsConfig {
  return RITUALS_CONFIG;
}
