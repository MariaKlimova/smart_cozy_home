import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { copy } from '@/copy/ru';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';
import type { INowSuggestion, INowSuggestionBedroomDevice } from '@/domain/nowSuggestion.typings';
import { getPrimaryGentleNotificationId, resolveNowSuggestion } from '@/domain/nowSuggestion';
import { localizeNowSuggestion } from '@/features/now/lib/localizeNowSuggestion';
import type { IBedroomReadings } from '@/features/now/lib/bedroomReadings.typings';
import { runNowDeviceAction } from '@/features/now/lib/runNowDeviceAction';
import { useBedroomControls } from '@/features/bedroom/lib/useBedroomControls';
import { useRunScenario } from '@/features/scenarios/lib/useRunScenario';
import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';
import { useScheduleClockTick } from '@/features/scenarios/lib/useScheduleClockTick';
import type { IScenario } from '@/domain/types';
import { useHomeStore } from '@/store/homeStore';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';

import { NOW_HOME_ERROR_TOAST_MS } from './useNowHome.const';

type TTimedErrorTarget = 'manual' | 'device';

function mapBedroomDevicesForSuggestion(
  devices: IBedroomDeviceState[] | undefined,
): INowSuggestionBedroomDevice[] {
  if (!devices) {
    return [];
  }

  return devices.map((device) => {
    if (device.control === 'toggle') {
      const toggleValue = device.value && 'isOn' in device.value ? device.value.isOn : undefined;
      return {
        id: device.id,
        isAvailable: device.isAvailable,
        control: device.control,
        isOn: toggleValue,
      };
    }

    if (device.control === 'segmented') {
      const segmentValue =
        device.value && 'activeOptionId' in device.value ? device.value.activeOptionId : undefined;
      return {
        id: device.id,
        isAvailable: device.isAvailable,
        control: device.control,
        activeOptionId: segmentValue,
      };
    }

    return {
      id: device.id,
      isAvailable: device.isAvailable,
      control: device.control,
    };
  });
}

interface IUseNowHomeResult {
  /** Primary action */
  suggestion: INowSuggestion;
  /** Сценарии дома */
  scenarios: IScenario[];
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
  /** Выполнить device primary action */
  runDeviceAction: () => Promise<void>;
  /** id gentle-уведомления в primary slot (для dedupe) */
  primaryGentleNotificationId: string | null;
  /** Идёт device action */
  isDeviceActionRunning: boolean;
}

/** Оркестрация Home State и primary action на табе «Сейчас» */
export function useNowHome(bedroomReadings: IBedroomReadings): IUseNowHomeResult {
  const {
    runStateById,
    activeScenarioId,
    preparedScenarioId,
    lastError: scenarioError,
    runScenarioById,
    clearError: clearScenarioError,
  } = useRunScenario();
  const scenarios = useHomeStore((s) => s.scenarios);
  const gentleNotifications = useHomeStore((s) => s.gentleNotifications);
  const dismissedGentleNotificationIds = useHomeStore((s) => s.dismissedGentleNotificationIds);
  const acceptGentleNotification = useHomeStore((s) => s.acceptGentleNotification);
  const nightSchedule = useSleepScheduleStore((s) => s.schedule);
  const scheduleNow = useScheduleClockTick();
  const { devices, setToggle, setSegment } = useBedroomControls({ enabled: true });

  const [isManualControlOpen, setIsManualControlOpen] = useState(false);
  const [manualControlError, setManualControlError] = useState<string | null>(null);
  const [deviceActionError, setDeviceActionError] = useState<string | null>(null);
  const [isDeviceActionRunning, setIsDeviceActionRunning] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bedroomDevices = useMemo(
    () => mapBedroomDevicesForSuggestion(devices),
    [devices],
  );

  const suggestion = useMemo(
    () =>
      localizeNowSuggestion(
        resolveNowSuggestion({
          now: scheduleNow,
          nightSchedule,
          activeScenarioId,
          preparedScenarioId,
          bedroomReadings: {
            co2Ppm: bedroomReadings.co2Ppm,
            humidityPct: bedroomReadings.humidityPct,
          },
          bedroomDevices,
          gentleNotifications,
          dismissedGentleNotificationIds,
        }),
      ),
    [
      scheduleNow,
      nightSchedule,
      activeScenarioId,
      preparedScenarioId,
      bedroomReadings.co2Ppm,
      bedroomReadings.humidityPct,
      bedroomDevices,
      gentleNotifications,
      dismissedGentleNotificationIds,
    ],
  );

  const primaryGentleNotificationId = getPrimaryGentleNotificationId(suggestion);

  const clearTimedErrors = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setManualControlError(null);
    setDeviceActionError(null);
  }, []);

  const clearError = useCallback(() => {
    clearScenarioError();
    clearTimedErrors();
  }, [clearScenarioError, clearTimedErrors]);

  const showTimedError = useCallback(
    (message: string, target: TTimedErrorTarget) => {
      clearScenarioError();
      setManualControlError(null);
      setDeviceActionError(null);
      if (target === 'manual') {
        setManualControlError(message);
      } else {
        setDeviceActionError(message);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = setTimeout(() => {
        if (target === 'manual') {
          setManualControlError(null);
        } else {
          setDeviceActionError(null);
        }
        errorTimerRef.current = null;
      }, NOW_HOME_ERROR_TOAST_MS);
    },
    [clearScenarioError],
  );

  const showManualControlError = useCallback(() => {
    showTimedError(copy.quickActions.manualControlFailed, 'manual');
  }, [showTimedError]);

  const runBedroomDeviceAction = useCallback(
    async (deviceId: string, action: TBedroomDeviceAction): Promise<boolean> => {
      if (action.kind === 'toggle') {
        return setToggle(deviceId, action.isOn);
      }
      if (action.kind === 'segment') {
        return setSegment(deviceId, action.optionId);
      }
      return false;
    },
    [setSegment, setToggle],
  );

  const runDeviceAction = useCallback(async () => {
    if (suggestion.kind !== 'device') {
      return;
    }

    setIsDeviceActionRunning(true);
    try {
      const ok = await runNowDeviceAction({
        actionId: suggestion.actionId,
        acceptGentleNotification,
        runBedroomDeviceAction,
      });
      if (!ok) {
        showTimedError(copy.now.deviceActionFailed, 'device');
      }
    } catch {
      showTimedError(copy.now.deviceActionFailed, 'device');
    } finally {
      setIsDeviceActionRunning(false);
    }
  }, [acceptGentleNotification, runBedroomDeviceAction, showTimedError, suggestion]);

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

  const lastError = deviceActionError ?? manualControlError ?? scenarioError;

  return {
    suggestion,
    scenarios,
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
    runDeviceAction,
    primaryGentleNotificationId,
    isDeviceActionRunning,
  };
}
