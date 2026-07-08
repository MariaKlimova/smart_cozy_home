import type { ISleepNightSummary } from '@/domain/sleepNight.typings';

export interface IWeekGridPageProps {
  /** Сводки по ночам */
  nights: ISleepNightSummary[];
  /** Ширина страницы */
  pageWidth: number;
  /** Подпись диапазона недели */
  weekRangeLabel: string;
  /** Выбор ночи */
  onSelectNight: (night: ISleepNightSummary) => void;
  /** nightDate выбранной ночи для подсветки */
  selectedNightDate?: string;
  /** Идёт загрузка */
  isLoading: boolean;
}

export interface ISleepWeekPageProps {
  /** Смещение недели */
  weekOffset: number;
  /** Ширина страницы */
  pageWidth: number;
  /** Выбор ночи */
  onSelectNight: (night: ISleepNightSummary) => void;
  /** nightDate выбранной ночи для подсветки */
  selectedNightDate?: string;
}
