import type {
  IScenarioWeeklySchedule,
  IScenarioWeeklyScheduleData,
} from '@/domain/scenarioWeeklySchedule.typings';

/** Расписание без метаданных HA для записи */
export function toScheduleData(
  schedule: IScenarioWeeklySchedule | undefined,
): IScenarioWeeklyScheduleData | null {
  if (!schedule) {
    return null;
  }
  const { isAvailable, ...data } = schedule;
  return data;
}

/** Идёт запись любого поля расписания */
export function isSchedulePendingKey(fieldKey: string | undefined): boolean {
  if (!fieldKey) {
    return false;
  }
  if (fieldKey === 'scheduleEnabled') {
    return true;
  }
  return fieldKey.startsWith('weekday-');
}
