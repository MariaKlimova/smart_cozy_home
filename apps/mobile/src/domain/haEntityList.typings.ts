/** Элемент списка entities для экрана настройщика */
export interface IHaEntityListItem {
  /** entity_id, например light.kitchen */
  entityId: string;
  /** Домен: light, sensor, person… */
  domain: string;
  /** Текущее state */
  state: string;
  /** Человекочитаемое имя из attributes */
  friendlyName: string;
}
