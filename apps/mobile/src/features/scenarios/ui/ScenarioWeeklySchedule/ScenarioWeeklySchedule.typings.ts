import type { IScenarioWeeklySchedule, TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

export interface IScenarioWeeklyScheduleProps {
  /** Недельное расписание */
  schedule: IScenarioWeeklySchedule;
  /** Ключ поля с активной записью */
  pendingFieldKey: string | undefined;
  /** Мастер-переключатель */
  onScheduleEnabledChange: (enabled: boolean) => Promise<boolean>;
  /** Переключить день */
  onWeekdayEnabledChange: (weekdayId: TWeekdayId, enabled: boolean) => Promise<boolean>;
  /** Изменить время дня */
  onWeekdayTimeChange: (weekdayId: TWeekdayId, time: string) => Promise<boolean>;
}
