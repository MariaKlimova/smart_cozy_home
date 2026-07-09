/** Парсит nightDate (YYYY-MM-DD) в локальную полночь */
export function parseLocalNightDate(nightDate: string): Date {
  const [yearStr, monthStr, dayStr] = nightDate.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 0, 0, 0, 0);
}
