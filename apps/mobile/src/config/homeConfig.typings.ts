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

/** Ссылка на одну entity в HA */
export interface IHaEntityRef {
  /** entity_id в Home Assistant */
  entity: string;
}

/** Ссылка на несколько entities в HA */
export interface IHaEntitiesRef {
  /** entity_id для агрегации (например, сводка света) */
  entities: string[];
}

/** Датчики спальни для таба «Сейчас» */
export interface IBedroomSensorsMapping {
  /** CO₂, ppm */
  co2: IHaEntityRef;
  /** Температура, °C */
  temperature: IHaEntityRef;
  /** Влажность, % */
  humidity: IHaEntityRef;
}

/** Маппинг сущностей для карточки состояния дома */
export interface IHomeStateMapping {
  /** Датчик температуры */
  temperature: IHaEntityRef;
  /** Свет для сводки вкл/выкл */
  light_summary: IHaEntitiesRef;
  /** Охрана / сигнализация */
  security: IHaEntityRef;
}

/** Person в конфиге присутствия */
export interface IPresencePersonMapping {
  /** entity_id person.* */
  entity: string;
  /** Подпись в UI */
  label: string;
}

/** Маппинг присутствия людей */
export interface IPresenceMapping {
  /** Список person entities */
  persons: IPresencePersonMapping[];
}

/** Маппинг сущностей для ленты дня */
export interface ITimelineMapping {
  /** entity_id для отслеживания в logbook */
  entity_watch: string[];
}

/** HA-сущности для состояния сценариев */
export interface IScenariosHaMapping {
  /** input_select.home_mode — активный режим */
  home_mode: IHaEntityRef;
  /** input_boolean — дом подготовлен к приезду */
  prepared: IHaEntityRef;
  /** option в home_mode при выходе из режима */
  exit_home_mode_option: string;
}

/** Мягкое уведомление в конфиге */
export interface IGentleNotificationMapping {
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
}

/** Тип контрола устройства в UI */
export type TDeviceControlKind = 'slider' | 'toggle' | 'segmented';

/** Границы slider-контрола */
export interface IDeviceSliderBounds {
  /** Минимум */
  min: number;
  /** Максимум */
  max: number;
  /** Шаг */
  step: number;
}

/** Опция segmented-контрола */
export interface IDeviceSegmentOption {
  /** id опции, например open */
  id: string;
  /** Подпись, например «Открыты» */
  label: string;
  /** Значение для HA (position 0/50/100) */
  value: number;
}

/** Маппинг одного устройства спальни */
export interface IBedroomDeviceMapping {
  /** Domain id: light, climate, curtains… */
  id: string;
  /** Название для UI */
  label: string;
  /** Тип контрола */
  control: TDeviceControlKind;
  /** entity_id в HA */
  entity: string;
  /** Для slider */
  slider?: IDeviceSliderBounds;
  /** Для segmented */
  segments?: IDeviceSegmentOption[];
}

/** Секция управляемых устройств спальни */
export interface IBedroomDevicesMapping {
  /** Устройства в порядке отображения */
  devices: IBedroomDeviceMapping[];
}

/** Конфигурация дома: маппинг HA → domain */
export interface IHomeConfig {
  /** Датчики спальни */
  bedroom_sensors: IBedroomSensorsMapping;
  /** Управляемые устройства спальни */
  bedroom_devices: IBedroomDevicesMapping;
  /** Сущности для карточки состояния дома */
  home_state: IHomeStateMapping;
  /** Комнаты */
  rooms: IRoomMapping[];
  /** Присутствие людей */
  presence: IPresenceMapping;
  /** Сущности для ленты дня */
  timeline: ITimelineMapping;
  /** Мягкие уведомления */
  gentle_notifications: IGentleNotificationMapping[];
  /** Сущности HA для активного сценария */
  scenarios_ha: IScenariosHaMapping;
}
