import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { copy } from '@/copy/ru';
import { useRunScenario } from '@/features/scenarios/lib/useRunScenario';
import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';

import { getContextualScenarioId } from './getContextualScenarioId';
import { QUICK_ACTION_ERROR_TOAST_MS } from './useQuickActions.const';

interface IUseQuickActionsResult {
  /** id контекстного сценария по времени суток; null — только ручное управление */
  contextualScenarioId: string | null;
  /** Открыт ли sheet ручного управления */
  isManualControlOpen: boolean;
  /** Открыть sheet ручного управления */
  openManualControl: () => void;
  /** Закрыть sheet */
  closeManualControl: () => void;
  /** Текст ошибки для toast */
  lastError: string | null;
  /** Сбросить ошибку toast */
  clearError: () => void;
  /** Показать ошибку ручного управления */
  showManualControlError: () => void;
  /** Состояние запуска сценариев */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим из store */
  activeScenarioId: string | null;
  /** Подготовленный сценарий из store */
  preparedScenarioId: string | null;
  /** Запустить сценарий по id */
  runScenarioById: (scenarioId: string) => Promise<void>;
}

/** Оркестрация контекстного сценария и ручного управления на табе «Сейчас» */
export function useQuickActions(): IUseQuickActionsResult {
  const {
    runStateById,
    activeScenarioId,
    preparedScenarioId,
    lastError: ritualError,
    runScenarioById,
    clearError: clearRitualError,
  } = useRunScenario();
  const [isManualControlOpen, setIsManualControlOpen] = useState(false);
  const [manualControlError, setManualControlError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contextualScenarioId = useMemo(() => getContextualScenarioId(), []);

  const clearManualControlError = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setManualControlError(null);
  }, []);

  const clearError = useCallback(() => {
    clearRitualError();
    clearManualControlError();
  }, [clearRitualError, clearManualControlError]);

  const showManualControlError = useCallback(() => {
    setManualControlError(copy.quickActions.manualControlFailed);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      setManualControlError(null);
      errorTimerRef.current = null;
    }, QUICK_ACTION_ERROR_TOAST_MS);
  }, []);

  const openManualControl = useCallback(() => {
    setIsManualControlOpen(true);
  }, []);

  const closeManualControl = useCallback(() => {
    setIsManualControlOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const lastError = ritualError ?? manualControlError;

  return {
    contextualScenarioId,
    isManualControlOpen,
    openManualControl,
    closeManualControl,
    lastError,
    clearError,
    showManualControlError,
    runStateById,
    activeScenarioId,
    preparedScenarioId,
    runScenarioById,
  };
}
