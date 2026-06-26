import { useCallback, useEffect, useRef, useState } from 'react';

import { copy } from '@/copy/ru';
import { exitActiveScenario, runScenario } from '@/domain/scenarioRunner';
import { getScenarioDefinition } from '@/features/scenarios/config/scenarios';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';

import { SCENARIO_ERROR_TOAST_MS } from './useRunScenario.const';

/** Transient-состояние запуска одной карточки */
export type TScenarioRunState = 'idle' | 'running';

interface IUseRunScenarioResult {
  /** Состояние запуска по id сценария */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим из store (sync с HA) */
  activeScenarioId: string | null;
  /** Подготовленный сценарий из store */
  preparedScenarioId: string | null;
  /** Текст последней ошибки для toast */
  lastError: string | null;
  /** Запустить / выйти / перезапустить сценарий */
  runScenarioById: (scenarioId: string) => Promise<void>;
  /** Сбросить ошибку toast */
  clearError: () => void;
}

/** Запуск сценария через HA с индикацией состояния карточки */
export function useRunScenario(): IUseRunScenarioResult {
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const profile = useConnectionStore((s) => s.profile);
  const isConnected = useConnectionStore((s) => s.isConnected);
  const refresh = useHomeStore((s) => s.refresh);
  const activeScenarioId = useHomeStore((s) => s.activeScenarioId);
  const preparedScenarioId = useHomeStore((s) => s.preparedScenarioId);
  const setScenarioActivation = useHomeStore((s) => s.setScenarioActivation);
  const [runStateById, setRunStateById] = useState<Record<string, TScenarioRunState>>({});
  const [lastError, setLastError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setScenarioState = useCallback((scenarioId: string, state: TScenarioRunState) => {
    setRunStateById((prev) => ({ ...prev, [scenarioId]: state }));
  }, []);

  const clearError = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setLastError(null);
  }, []);

  const showError = useCallback(() => {
    setLastError(copy.scenarios.runFailed);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      setLastError(null);
      errorTimerRef.current = null;
    }, SCENARIO_ERROR_TOAST_MS);
  }, []);

  const runScenarioById = useCallback(
    async (scenarioId: string) => {
      if (!isConnected || !baseUrl || !profile) {
        showError();
        return;
      }

      if (runStateById[scenarioId] === 'running') {
        return;
      }

      const definition = getScenarioDefinition(scenarioId);
      const isActiveMode =
        definition?.kind === 'mode' && activeScenarioId === scenarioId;

      if (isActiveMode) {
        setScenarioState(scenarioId, 'running');
        clearError();
        try {
          await exitActiveScenario(baseUrl, profile.accessToken);
          setScenarioActivation(null, preparedScenarioId);
          await refresh({ silent: true });
        } catch {
          showError();
        } finally {
          setScenarioState(scenarioId, 'idle');
        }
        return;
      }

      setScenarioState(scenarioId, 'running');
      clearError();

      try {
        await runScenario(scenarioId, baseUrl, profile.accessToken);

        if (definition?.kind === 'prepared') {
          setScenarioActivation(null, scenarioId);
        } else if (definition?.kind === 'mode') {
          setScenarioActivation(scenarioId, null);
        }

        await refresh({ silent: true });
      } catch {
        showError();
      } finally {
        setScenarioState(scenarioId, 'idle');
      }
    },
    [
      isConnected,
      baseUrl,
      profile,
      runStateById,
      activeScenarioId,
      preparedScenarioId,
      setScenarioState,
      clearError,
      showError,
      refresh,
      setScenarioActivation,
    ],
  );

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  return {
    runStateById,
    activeScenarioId,
    preparedScenarioId,
    lastError,
    runScenarioById,
    clearError,
  };
}
