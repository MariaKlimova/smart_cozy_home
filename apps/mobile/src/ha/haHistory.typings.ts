/** Сырой state из HA history API */
export interface IHaHistoryState {
  /** entity_id */
  entity_id: string;
  /** state string */
  state: string;
  /** ISO-время изменения */
  last_changed: string;
}
