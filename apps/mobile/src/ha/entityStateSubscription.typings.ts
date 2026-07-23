/** Параметры persistent WebSocket-подписки на watched entities */
export interface IEntityStateSubscriptionParams {
  /** Активный base URL из connectionStore (после resolveActiveBaseUrl) */
  baseUrl: string;
  /** Long-lived access token Home Assistant */
  accessToken: string;
  /** entity_id из config / collectWatchedEntityIds — только они триггерят onWatchedChange */
  entityIds: string[];
  /** Вызывается при изменении любого watched entity (уже с debounce) */
  onWatchedChange: () => void;
}

/** Управление активной подпиской */
export interface IEntityStateSubscriptionHandle {
  /** Закрыть WebSocket, снять subscribeEntities и отменить debounce */
  stop: () => void;
}
