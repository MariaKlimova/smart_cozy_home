/** Тип поведения сценария после запуска */
export type TScenarioKind = 'mode' | 'prepared';

/** Определение сценария в конфиге */
export interface IScenarioDefinition {
  /** id сценария, например evening */
  id: string;
  /** Название в UI */
  label: string;
  /** Иконка FontAwesome */
  icon: string;
  /** entity_id script в HA (только в config, не в UI) */
  script: string;
  /** Есть ли расписание (Вечер, Сон, Утро) */
  hasSchedule: boolean;
  /** Дефолтное время HH:mm — до SH-15 */
  defaultScheduleTime?: string;
  /** Режим (длительный) или подготовка (еду домой) */
  kind: TScenarioKind;
  /** Значение option в input_select.home_mode для режимов */
  homeModeOption: string;
}
