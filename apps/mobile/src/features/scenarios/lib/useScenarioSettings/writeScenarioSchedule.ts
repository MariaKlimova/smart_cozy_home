import type { MutableRefObject } from 'react';

import { copy } from '@/copy/ru';
import type {
  IScenarioWeeklySchedule,
  IScenarioWeeklyScheduleData,
  TWeekdayId,
} from '@/domain/scenarioWeeklySchedule.typings';
import { patchWeekdaySchedule, serializeWeeklyScheduleJson } from '@/domain/scenarioWeeklySchedule';
import { toScheduleData } from '@/features/scenarios/lib/scenarioSettingsSchedule';
import { setTextValue } from '@/ha/haClient';
import { getScenarioFieldEntityId } from '@/ha/mappers/mapScenarioSettings';

import { SCHEDULE_FIELD_KEY } from './scheduleFieldKeys';
import type { TExecuteWriteFn } from './writeScenarioParam';

/** Зависимости записи расписания */
export interface IScenarioScheduleWriteDeps {
  /** id сценария */
  scenarioId: string;
  /** Base URL HA */
  haBaseUrl: string;
  /** Token HA */
  haToken: string;
  /** Черновик расписания */
  scheduleDraftRef: MutableRefObject<IScenarioWeeklyScheduleData | null>;
  /** Очередь последовательных записей */
  scheduleWriteQueueRef: MutableRefObject<Promise<boolean>>;
  /** Общий write-path */
  executeWrite: TExecuteWriteFn;
  /** Расписание с сервера (для rollback) */
  getServerSchedule: () => IScenarioWeeklySchedule | undefined;
  /** Показать ошибку записи */
  setWriteError: (message: string | undefined) => void;
}

/** Создаёт API записи недельного расписания */
export function createScenarioScheduleWriter(deps: IScenarioScheduleWriteDeps) {
  const {
    scenarioId,
    haBaseUrl,
    haToken,
    scheduleDraftRef,
    scheduleWriteQueueRef,
    executeWrite,
    getServerSchedule,
    setWriteError,
  } = deps;

  function enqueueScheduleWrite(
    fieldKey: string,
    write: () => Promise<void>,
  ): Promise<boolean> {
    const run = scheduleWriteQueueRef.current
      .catch(() => true)
      .then(() => executeWrite(fieldKey, write));

    scheduleWriteQueueRef.current = run;
    return run;
  }

  async function persistWeeklySchedule(fieldKey: string): Promise<boolean> {
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
  }

  async function patchSchedule(
    fieldKey: string,
    patch: (current: IScenarioWeeklyScheduleData) => IScenarioWeeklyScheduleData,
  ): Promise<boolean> {
    const current = scheduleDraftRef.current;
    if (!current) {
      return false;
    }

    scheduleDraftRef.current = patch(current);
    const applied = await persistWeeklySchedule(fieldKey);

    if (!applied) {
      scheduleDraftRef.current = toScheduleData(getServerSchedule());
    }

    return applied;
  }

  async function setScheduleEnabled(enabled: boolean): Promise<boolean> {
    return patchSchedule(SCHEDULE_FIELD_KEY.enabled, (current) => ({
      ...current,
      enabled,
    }));
  }

  async function setWeekdayEnabled(weekdayId: TWeekdayId, enabled: boolean): Promise<boolean> {
    return patchSchedule(SCHEDULE_FIELD_KEY.weekday(weekdayId), (current) =>
      patchWeekdaySchedule(current, weekdayId, { enabled }),
    );
  }

  async function setWeekdayTime(weekdayId: TWeekdayId, time: string): Promise<boolean> {
    return patchSchedule(SCHEDULE_FIELD_KEY.weekdayTime(weekdayId), (current) =>
      patchWeekdaySchedule(current, weekdayId, { time }),
    );
  }

  return {
    setScheduleEnabled,
    setWeekdayEnabled,
    setWeekdayTime,
  };
}
