export interface IRoomsStatusHintProps {
  /** Основной текст подсказки (offline / sync error) */
  message: string;
  /** ISO времени последней синхронизации; null — не показывать суффикс */
  lastSyncAt: string | null;
}
