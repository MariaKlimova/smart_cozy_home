/**
 * Typed mapping (зеркало config/rituals.default.yaml).
 * При изменении YAML обновите и этот файл.
 */

/** Маппинг ритуала на script HA */
export interface IRitualMapping {
  /** Подпись в UI */
  label: string;
  /** entity_id script в HA */
  script: string;
  /** Имя иконки FontAwesome */
  icon: string;
}

/** Маппинг комнаты на entities HA */
export interface IRoomMapping {
  /** id комнаты в domain */
  id: string;
  /** Подпись в UI */
  label: string;
  /** area_id в HA */
  area_id: string;
  /** entity_id света */
  light: string;
  /** entity_id климата (опционально) */
  climate?: string;
}

/** Конфигурация ритуалов и маппинга HA → domain */
export interface IRitualsConfig {
  /** Ритуалы по id */
  rituals: Record<string, IRitualMapping>;
  /** Сущности для карточки состояния дома */
  home_state: {
    /** Датчик температуры */
    temperature: { entity: string };
    /** Свет для сводки вкл/выкл */
    light_summary: { entities: string[] };
    /** Охрана / сигнализация */
    security: { entity: string };
  };
  /** Комнаты */
  rooms: IRoomMapping[];
  /** Присутствие людей */
  presence: {
    /** person entities */
    persons: { entity: string; label: string }[];
  };
  /** Сущности для ленты дня */
  timeline: {
    /** entity_id для logbook */
    entity_watch: string[];
  };
  /** Мягкие уведомления */
  gentle_notifications: {
    /** id уведомления */
    id: string;
    /** id комнаты */
    room_id: string;
    /** entity_id света для включения */
    light_entity: string;
    /** entity_id датчика присутствия */
    occupancy_entity: string;
    /** Текст предложения */
    message: string;
  }[];
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
