export type { IConnectionProfile } from '@/domain/connection.typings';

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
