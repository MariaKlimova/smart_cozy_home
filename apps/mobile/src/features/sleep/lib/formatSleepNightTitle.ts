import { copy } from '@/copy/ru';
import { parseLocalNightDate } from '@/domain/parseLocalNightDate';

/** Заголовок деталей ночи, например «Ночь, среда, 1 июля» */
export function formatSleepNightDetailTitle(nightDate: string): string {
  const date = parseLocalNightDate(nightDate);
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' });
  const datePart = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `${copy.sleep.nightDetailTitle}, ${weekday}, ${datePart}`;
}
