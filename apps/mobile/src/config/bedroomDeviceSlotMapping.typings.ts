/** Слот устройства спальни */
export type TBedroomDeviceSlot =
  | 'light'
  | 'nightlight'
  | 'air_conditioner'
  | 'ventilation'
  | 'radiator'
  | 'curtains'
  | 'humidifier'
  | 'window';

/** Пользовательская конфигурация устройств спальни */
export interface IBedroomDeviceUserConfig {
  /** Переопределения entity_id по слотам */
  entities: Partial<Record<TBedroomDeviceSlot, string>>;
  /** Слоты, скрытые из списка на экране спальни */
  hiddenSlots: TBedroomDeviceSlot[];
}
