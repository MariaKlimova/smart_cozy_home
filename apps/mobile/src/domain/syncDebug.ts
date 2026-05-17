/** Снимок последней синхронизации с HA (для экрана проверки) */
export interface IHomeSyncDebug {
  /** ISO время последней успешной синхронизации */
  lastSyncAt: string | null;
  /** Текст ошибки последней попытки */
  lastError: string | null;
  /** Сколько entity_id запросили из mapping */
  entitiesRequested: number;
  /** Сколько состояний реально получили */
  entitiesReceived: number;
  /** entity_id из config, которых нет в HA */
  missingEntityIds: string[];
  /** Событий в timeline после маппинга */
  timelineEvents: number;
  /** Записей logbook от HA */
  logbookEntries: number;
  /** Краткие строки state для проверки (entity → state) */
  statePreview: string[];
}

export function createEmptySyncDebug(): IHomeSyncDebug {
  return {
    lastSyncAt: null,
    lastError: null,
    entitiesRequested: 0,
    entitiesReceived: 0,
    missingEntityIds: [],
    timelineEvents: 0,
    logbookEntries: 0,
    statePreview: [],
  };
}
