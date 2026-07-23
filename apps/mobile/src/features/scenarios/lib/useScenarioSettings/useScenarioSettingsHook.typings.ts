import type { TLightColorValue } from '@/domain/lightColor.typings';
import type { IScenarioSettings } from '@/domain/scenarioSettings.typings';
import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

/** Опции хука настроек сценария */
export interface IUseScenarioSettingsOptions {
  /**
   * Entity_id ночника для seed пресетов цвета.
   * Резолвится снаружи (маршрут / adapter), без прямого доступа к bedroom store.
   */
  nightlightEntityId?: string;
}

export interface IUseScenarioSettingsResult {
  /** Настройки сценария */
  settings: IScenarioSettings | undefined;
  /** Идёт первая загрузка */
  isLoading: boolean;
  /** Ошибка запроса */
  isError: boolean;
  /** Идёт обновление */
  isRefreshing: boolean;
  /**
   * UI-ключ занятости записи (domain field key или токен расписания
   * вроде `scheduleEnabled` / `weekday-time-mon`), не обязательно ключ поля настроек
   */
  pendingFieldKey: string | undefined;
  /** Есть недоступные helpers */
  hasMissingFields: boolean;
  /** Сообщение об ошибке последней записи */
  writeError: string | undefined;
  /** Записать числовой параметр */
  setNumber: (key: string, value: number) => Promise<boolean>;
  /** Записать булевый параметр */
  setBoolean: (key: string, value: boolean) => Promise<boolean>;
  /** Записать цветовой параметр */
  setColor: (key: string, color: TLightColorValue) => Promise<boolean>;
  /** Записать текстовый параметр */
  setText: (key: string, value: string) => Promise<boolean>;
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
