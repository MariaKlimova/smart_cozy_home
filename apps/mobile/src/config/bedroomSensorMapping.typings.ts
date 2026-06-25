/** Слот датчика спальни */
export type TBedroomSensorSlot = 'temperature' | 'humidity' | 'co2';

/** Пользовательские привязки entity_id (только слой config/ha) */
export interface IBedroomSensorMapping {
  /** entity_id температуры; null — слот отключён */
  temperature?: string | null;
  /** entity_id влажности; null — слот отключён */
  humidity?: string | null;
  /** entity_id CO₂; null — слот отключён */
  co2?: string | null;
}
