import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getScenarioDefinition } from '@/config/scenarios';
import { copy } from '@/copy/ru';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import type { IScenarioWeeklyScheduleData } from '@/domain/scenarioWeeklySchedule.typings';
import { toScheduleData } from '@/features/scenarios/lib/scenarioSettingsSchedule';
import { getScenarioParamEntityIds } from '@/ha/mappers/mapScenarioSettings';
import { useHaBackend } from '@/hooks/useHaBackend';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';

import { prepareScenarioSettings } from './prepareScenarioSettings';
import type {
  IUseScenarioSettingsOptions,
  IUseScenarioSettingsResult,
} from './useScenarioSettingsHook.typings';
import {
  writeScenarioBoolean,
  writeScenarioColor,
  writeScenarioNumber,
} from './writeScenarioParam';
import { createScenarioScheduleWriter } from './writeScenarioSchedule';

/** Сколько считать кэш настроек сценария свежим (TanStack Query staleTime) */
const SCENARIO_SETTINGS_STALE_MS = 30_000;

/** Оркестрация загрузки и записи настроек сценария через HA */
export function useScenarioSettings(
  scenarioId: string,
  options: IUseScenarioSettingsOptions = {},
): IUseScenarioSettingsResult {
  const queryClient = useQueryClient();
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const { haReady, baseUrl: haBaseUrl, token: haToken } = useHaBackend();
  const refreshHome = useHomeStore((s) => s.refresh);
  const scenarioDefinition = getScenarioDefinition(scenarioId);
  const nightlightEntityId = options.nightlightEntityId;

  const scenarioParamEntityIds = getScenarioParamEntityIds(scenarioId);

  const settingsQueryKey = useMemo(
    () => ['scenario-settings', scenarioId, baseUrl, nightlightEntityId] as const,
    [scenarioId, baseUrl, nightlightEntityId],
  );

  const [pendingFieldKey, setPendingFieldKey] = useState<string>();
  const [writeError, setWriteError] = useState<string>();
  const scheduleDraftRef = useRef<IScenarioWeeklyScheduleData | null>(null);
  const scheduleWriteQueueRef = useRef(Promise.resolve(true));

  const query = useQuery({
    queryKey: settingsQueryKey,
    enabled: Boolean(haReady && scenarioParamEntityIds.length > 0 && scenarioDefinition),
    staleTime: SCENARIO_SETTINGS_STALE_MS,
    queryFn: () =>
      prepareScenarioSettings({
        scenarioId,
        haBaseUrl,
        haToken,
        scenarioParamEntityIds,
        nightlightEntityId,
        defaultScheduleTime: scenarioDefinition?.defaultScheduleTime ?? '22:00',
      }),
  });

  useEffect(() => {
    scheduleDraftRef.current = toScheduleData(query.data?.schedule);
  }, [query.data?.schedule]);

  const invalidateAndRefreshHome = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    await refreshHome({ silent: true });
  }, [queryClient, settingsQueryKey, refreshHome]);

  const executeWrite = useCallback(
    async (fieldKey: string, write: () => Promise<void>): Promise<boolean> => {
      if (!haReady) return false;

      setPendingFieldKey(fieldKey);
      setWriteError(undefined);

      try {
        await write();
      } catch {
        setWriteError(copy.scenarios.writeFailed);
        setPendingFieldKey(undefined);
        return false;
      }

      try {
        await invalidateAndRefreshHome();
      } catch {
        // Запись в HA уже прошла — не показываем ошибку из‑за refresh/refetch
      } finally {
        setPendingFieldKey(undefined);
      }

      return true;
    },
    [haReady, invalidateAndRefreshHome],
  );

  const paramWriteCtx = useMemo(
    () => ({
      scenarioId,
      haBaseUrl,
      haToken,
      executeWrite,
    }),
    [scenarioId, haBaseUrl, haToken, executeWrite],
  );

  const scheduleWriter = useMemo(
    () =>
      createScenarioScheduleWriter({
        scenarioId,
        haBaseUrl,
        haToken,
        scheduleDraftRef,
        scheduleWriteQueueRef,
        executeWrite,
        getServerSchedule: () => query.data?.schedule,
        setWriteError,
      }),
    [scenarioId, haBaseUrl, haToken, executeWrite, query.data?.schedule],
  );

  const setNumber = useCallback(
    (key: string, value: number) => writeScenarioNumber(paramWriteCtx, key, value),
    [paramWriteCtx],
  );

  const setBoolean = useCallback(
    (key: string, value: boolean) => writeScenarioBoolean(paramWriteCtx, key, value),
    [paramWriteCtx],
  );

  const setColor = useCallback(
    (key: string, color: TLightColorValue) => writeScenarioColor(paramWriteCtx, key, color),
    [paramWriteCtx],
  );

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
    setColor,
    setScheduleEnabled: scheduleWriter.setScheduleEnabled,
    setWeekdayEnabled: scheduleWriter.setWeekdayEnabled,
    setWeekdayTime: scheduleWriter.setWeekdayTime,
    refresh: invalidateAndRefreshHome,
    dismissWriteError,
  };
}
