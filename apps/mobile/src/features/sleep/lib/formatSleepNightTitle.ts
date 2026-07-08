import { copy } from '@/copy/ru';

function parseLocalNightDate(nightDate: string): Date {
  const [yearStr, monthStr, dayStr] = nightDate.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
}

/** Заголовок деталей ночи, например «Ночь, среда, 1 июля» */
export function formatSleepNightDetailTitle(nightDate: string): string {
  const date = parseLocalNightDate(nightDate);
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' });
  const datePart = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `${copy.sleep.nightDetailTitle}, ${weekday}, ${datePart}`;
}
