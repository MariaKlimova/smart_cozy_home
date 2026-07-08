import { copy } from '@/copy/ru';
import { startOfLocalDay } from '@/domain/sleepNightWindows';

function formatShortMonth(monthIndex: number): string {
  return copy.sleep.monthsShort[monthIndex] ?? '';
}

/** Короткая подпись диапазона недели, например «1–7 июл» */
export function formatSleepWeekRangeFromEnd(weekEnd: Date): string {
  const end = startOfLocalDay(weekEnd);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const endMonth = formatShortMonth(end.getMonth());
  const startMonth = formatShortMonth(start.getMonth());

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${endMonth}`;
  }

  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
}
