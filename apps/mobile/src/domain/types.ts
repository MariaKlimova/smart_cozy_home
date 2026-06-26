export type LifeState =
  | 'morning'
  | 'evening'
  | 'work'
  | 'rest'
  | 'sleep'
  | 'guests'
  | 'away';

/** Метрика на главном экране */
export interface IHomeMetric {
  /** Ключ для иконки */
  id: string;
  /** Подпись, например «Температура» */
  label: string;
  /** Значение для человека, например «22°» */
  value: string;
}

/** Состояние дома для Home State Screen */
export interface IHomeState {
  /** Заголовок, например «Спокойный вечер» */
  title: string;
  /** Life state для внутренней логики */
  lifeState: LifeState;
  /** Короткая подсказка */
  hint: string;
  /** 3–4 живые метрики */
  metrics: IHomeMetric[];
}

/** Сценарий жизни дома */
export interface IScenario {
  /** id сценария, например evening */
  id: string;
  /** Название для UI */
  label: string;
  /** Имя иконки FontAwesome */
  icon: string;
  /** Есть ли автоматическое расписание */
  hasSchedule: boolean;
  /** Подпись под названием: «Сегодня в 22:30» или «Только вручную» */
  scheduleSubtitle: string;
}

/** @deprecated Используй IScenario */
export type IRitual = IScenario;

/** Комната */
export interface IRoom {
  /** id комнаты */
  id: string;
  /** Название */
  label: string;
  /** Свет включён */
  lightOn: boolean;
  /** Температура или undefined */
  temperature?: string;
}

/** Кто дома */
export interface IPresenceMember {
  /** id person в domain */
  id: string;
  /** Имя */
  label: string;
  /** Дома сейчас */
  isHome: boolean;
}

export type TimelineEventKind = 'presence_home' | 'ritual' | 'generic';

/** Событие в ленте */
export interface ITimelineEvent {
  /** Уникальный id */
  id: string;
  /** Тип события */
  kind: TimelineEventKind;
  /** ISO timestamp */
  at: string;
  /** Человекочитаемый текст */
  message: string;
  /** Для humanizer */
  entityId?: string;
  /** Для humanizer */
  ritualId?: string;
}

/** Мягкое уведомление */
export interface IGentleNotification {
  /** id */
  id: string;
  /** Текст предложения */
  message: string;
  /** id комнаты */
  roomId?: string;
  /** Действие при принятии */
  actionLabel?: string;
}
