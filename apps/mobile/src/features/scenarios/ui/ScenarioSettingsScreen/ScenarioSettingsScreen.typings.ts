import type { IScenarioSettings } from '@/domain/scenarioSettings.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';
import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';

export interface IScenarioSettingsScreenProps {
  /** id сценария */
  scenarioId: string;
  /** Краткое описание */
  description: string;
  /** Настройки из HA */
  settings: IScenarioSettings | undefined;
  /** Идёт загрузка */
  isLoading: boolean;
  /** Ошибка загрузки */
  isError: boolean;
  /** Идёт обновление */
  isRefreshing: boolean;
  /** Ключ поля с активной записью */
  pendingFieldKey: string | undefined;
  /** Есть недоступные helpers */
  hasMissingFields: boolean;
  /** Состояние запуска */
  runState: TScenarioRunState;
  /** Записать числовой параметр */
  onNumberChange: (key: string, value: number) => Promise<boolean>;
  /** Записать булевый параметр */
  onBooleanChange: (key: string, value: boolean) => Promise<boolean>;
  /** Записать цветовой параметр */
  onColorChange: (key: string, color: TLightColorValue) => Promise<boolean>;
  /** Включить/выключить расписание */
  onScheduleEnabledChange: (enabled: boolean) => Promise<boolean>;
  /** Переключить день */
  onWeekdayEnabledChange: (weekdayId: TWeekdayId, enabled: boolean) => Promise<boolean>;
  /** Изменить время дня */
  onWeekdayTimeChange: (weekdayId: TWeekdayId, time: string) => Promise<boolean>;
  /** Запустить сценарий */
  onRunNow: () => void;
  /** Обновить настройки */
  onRefresh: () => void;
}
