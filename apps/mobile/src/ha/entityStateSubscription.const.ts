/** Таймаут первичного WebSocket connect (мс) */
export const ENTITY_STATE_WS_CONNECT_TIMEOUT_MS = 15_000;

/** Debounce перед silent refresh после пачки state_changed (мс) */
export const ENTITY_STATE_CHANGE_DEBOUNCE_MS = 400;

/**
 * Число попыток первичного connect в home-assistant-js-websocket
 * (`setupRetry` — счётчик попыток, не миллисекунды).
 */
export const ENTITY_STATE_WS_SETUP_RETRY = 3;
