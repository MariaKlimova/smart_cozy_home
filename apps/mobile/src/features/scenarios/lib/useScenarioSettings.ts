import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getScenarioDefinition } from '@/config/scenarios';
import { copy } from '@/copy/ru';
import type { IScenarioSettings } from '@/domain/scenarioSettings.typings';
import type { IScenarioWeeklyScheduleData, TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';
import {
  patchWeekdaySchedule,
  serializeWeeklyScheduleJson,
} from '@/domain/scenarioWeeklySchedule';
import {
  toScheduleData,
} from '@/features/scenarios/lib/scenarioSettingsSchedule';
import {
  fetchEntityStates,
  setBooleanState,
  setNumberValue,
  setTextValue,
} from '@/ha/haClient';
import {
  getScenarioFieldEntityId,
  getScenarioParamEntityIds,
  mapScenarioSettings,
} from '@/ha/mappers/mapScenarioSettings';
import { useHaBackend } from '@/hooks/useHaBackend';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';

const SCENARIO_SETTINGS_STALE_MS = 30_000;

export interface IUseScenarioSettingsResult {
  /** Настройки сценария */
  settings: IScenarioSettings | undefined;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Идёт обновление */
  isRefreshing: boolean;
  /** Ключ поля с активной записью */
  pendingFieldKey: string | undefined;
  /** Есть недоступные helpers */
  hasMissingFields: boolean;
  /** Сообщение об ошибке последней записи */
  writeError: string | undefined;
  /** Записать числовой параметр */
  setNumber: (key: string, value: number) => Promise<boolean>;
  /** Записать булевый параметр */
  setBoolean: (key: string, value: boolean) => Promise<boolean>;
  /** Включить/выключить расписание */
  setScheduleEnabled: (enabled: boolean) => Promise<boolean>;
  /** Включить/выключить день */
  setWeekdayEnabled: (weekdayId: TWeekdayId, enabled: boolean) => Promise<boolean>;
  /** Установить время для дня */
  setWeekdayTime: (weekdayId: TWeekdayId, time: string) => Promise<boolean>;
  /** Обновить настройки */
  refresh: () => Promise<void>;
  /** Сбросить сообщение об ошибке записи */
  dismissWriteError: () => void;
}

/** Загрузка и запись настроек сценария через HA */
export function useScenarioSettings(scenarioId: string): IUseScenarioSettingsResult {
  const queryClient = useQueryClient();
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const refreshHome = useHomeStore((s) => s.refresh);
  const definition = getScenarioDefinition(scenarioId);
  const entityIds = useMemo(() => getScenarioParamEntityIds(scenarioId), [scenarioId]);
  const settingsQueryKey = useMemo(
    () => ['scenario-settings', scenarioId, baseUrl] as const,
    [scenarioId, baseUrl],
  );
  const [pendingFieldKey, setPendingFieldKey] = useState<string>();
  const [writeError, setWriteError] = useState<string>();
  const scheduleDraftRef = useRef<IScenarioWeeklyScheduleData | null>(null);
  const scheduleWriteQueueRef = useRef(Promise.resolve(true));

  const query = useQuery({
    queryKey: settingsQueryKey,
    enabled: Boolean(haReady && entityIds.length > 0 && definition),
    staleTime: SCENARIO_SETTINGS_STALE_MS,
    queryFn: async () => {
      const states = await fetchEntityStates(haBaseUrl, haToken, entityIds);
      return mapScenarioSettings(
        scenarioId,
        states,
        definition?.defaultScheduleTime ?? '22:00',
      );
    },
  });

  useEffect(() => {
    scheduleDraftRef.current = toScheduleData(query.data?.schedule);
  }, [query.data?.schedule]);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    await refreshHome({ silent: true });
  }, [queryClient, settingsQueryKey, refreshHome]);

  const writeField = useCallback(
    async (fieldKey: string, write: () => Promise<void>): Promise<boolean> => {
      if (!haReady) return false;
      setPendingFieldKey(fieldKey);
      setWriteError(undefined);
      try {
        await write();
        await invalidate();
        return true;
      } catch {
        setWriteError(copy.scenarios.writeFailed);
        return false;
      } finally {
        setPendingFieldKey(undefined);
      }
    },
    [haReady, invalidate],
  );

  const enqueueScheduleWrite = useCallback(
    (fieldKey: string, write: () => Promise<void>): Promise<boolean> => {
      const run = scheduleWriteQueueRef.current
        .catch(() => true)
        .then(async () => {
          if (!haReady) {
            return false;
          }
          setPendingFieldKey(fieldKey);
          setWriteError(undefined);
          try {
            await write();
            await invalidate();
            return true;
          } catch {
            setWriteError(copy.scenarios.writeFailed);
            return false;
          } finally {
            setPendingFieldKey(undefined);
          }
        });

      scheduleWriteQueueRef.current = run;
      return run;
    },
    [haReady, invalidate],
  );

  const persistWeeklySchedule = useCallback(
    async (fieldKey: string): Promise<boolean> => {
      const configEntityId = getScenarioFieldEntityId(scenarioId, 'scheduleConfig');
      if (!configEntityId) {
        setWriteError(copy.scenarios.writeFailed);
        return false;
      }

      return enqueueScheduleWrite(fieldKey, async () => {
        const latest = scheduleDraftRef.current;
        if (!latest) {
          throw new Error('Schedule draft is empty');
        }

        await setTextValue(
          haBaseUrl,
          haToken,
          configEntityId,
          serializeWeeklyScheduleJson(latest),
        );
      });
    },
    [scenarioId, haBaseUrl, haToken, enqueueScheduleWrite],
  );

  const patchSchedule = useCallback(
    async (
      fieldKey: string,
      patch: (current: IScenarioWeeklyScheduleData) => IScenarioWeeklyScheduleData,
    ): Promise<boolean> => {
      const current = scheduleDraftRef.current;
      if (!current) {
        return false;
      }

      scheduleDraftRef.current = patch(current);
      const applied = await persistWeeklySchedule(fieldKey);

      if (!applied) {
        scheduleDraftRef.current = toScheduleData(query.data?.schedule);
      }

      return applied;
    },
    [persistWeeklySchedule, query.data?.schedule],
  );

  const setNumber = useCallback(
    async (key: string, value: number) => {
      const entityId = getScenarioFieldEntityId(scenarioId, key);
      if (!entityId) return false;
      return writeField(key, () => setNumberValue(haBaseUrl, haToken, entityId, value));
    },
    [scenarioId, haBaseUrl, haToken, writeField],
  );

  const setBoolean = useCallback(
    async (key: string, value: boolean) => {
      const entityId = getScenarioFieldEntityId(scenarioId, key);
      if (!entityId) return false;
      return writeField(key, () => setBooleanState(haBaseUrl, haToken, entityId, value));
    },
    [scenarioId, haBaseUrl, haToken, writeField],
  );

  const setScheduleEnabled = useCallback(
    async (enabled: boolean) => {
      return patchSchedule('scheduleEnabled', (current) => ({ ...current, enabled }));
    },
    [patchSchedule],
  );

  const setWeekdayEnabled = useCallback(
    async (weekdayId: TWeekdayId, enabled: boolean) => {
      return patchSchedule(`weekday-${weekdayId}`, (current) =>
        patchWeekdaySchedule(current, weekdayId, { enabled }),
      );
    },
    [patchSchedule],
  );

  const setWeekdayTime = useCallback(
    async (weekdayId: TWeekdayId, time: string) => {
      return patchSchedule(`weekday-time-${weekdayId}`, (current) =>
        patchWeekdaySchedule(current, weekdayId, { time }),
      );
    },
    [patchSchedule],
  );

  const refresh = useCallback(async () => {
    await invalidate();
  }, [invalidate]);

  const dismissWriteError = useCallback(() => {
    setWriteError(undefined);
  }, []);

  return {
    settings: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    isRefreshing: query.isFetching && !query.isPending,
    pendingFieldKey,
    hasMissingFields: (query.data?.missingFieldKeys.length ?? 0) > 0,
    writeError,
    setNumber,
    setBoolean,
    setScheduleEnabled,
    setWeekdayEnabled,
    setWeekdayTime,
    refresh,
    dismissWriteError,
  };
}
