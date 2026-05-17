import type { IHomeSyncDebug } from '@/domain/syncDebug';

export interface IDataSyncStatusProps {
  /** Подключены ли к HA */
  isConnected: boolean;
  /** URL (маскированный) */
  baseUrl: string | null;
  /** Снимок синхронизации */
  syncDebug: IHomeSyncDebug;
  /** Идёт обновление */
  isRefreshing: boolean;
  /** Запросить данные заново */
  onRefresh: () => void;
}
