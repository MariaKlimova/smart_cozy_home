import type { TConnectionFailureReason } from '@/domain/connection.typings';

export type { IConnectionProfile, TConnectionFailureReason } from '@/domain/connection.typings';

/** Результат health-check */
export interface IConnectionHealth {
  /** Доступен ли endpoint */
  ok: boolean;
  /** Использованный base URL */
  baseUrl: string;
  /** Причина неудачи для UI-слоя */
  failureReason?: TConnectionFailureReason;
  /** Техническое сообщение (debug, не для пользователя) */
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
