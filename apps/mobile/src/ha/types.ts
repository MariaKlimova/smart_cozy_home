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

/** Результат health-check */
export interface IConnectionHealth {
  /** Доступен ли endpoint */
  ok: boolean;
  /** Использованный base URL */
  baseUrl: string;
  /** Сообщение об ошибке */
  error?: string;
}

/** Снимок состояния entity из HA */
export interface IHaEntityState {
  /** entity_id */
  entityId: string;
  /** state string */
  state: string;
  /** attributes */
  attributes: Record<string, unknown>;
}
