/** Причина неудачного подключения (внутренний код, не для UI) */
export type TConnectionFailureReason =
  | 'token_invalid'
  | 'ha_unavailable'
  | 'no_url'
  | 'unknown';

/** Статус подключения для UI */
export type TConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'no_profile'
  | 'no_network'
  | 'ha_unavailable'
  | 'token_invalid'
  | 'error';

/** Профиль подключения к Home Assistant */
export interface IConnectionProfile {
  /** Уникальный id профиля */
  id: string;
  /** Название, например «Дом» */
  name: string;
  /** http://192.168.x.x:8123 */
  localUrl?: string;
  /** https://xxx.ui.nabu.casa */
  remoteUrl?: string;
  /** Long-lived access token */
  accessToken: string;
  /** Стратегия выбора endpoint */
  preferred: 'auto' | 'local' | 'remote';
}
