import { useEffect, useState } from 'react';

const SCHEDULE_CLOCK_TICK_MS = 60_000;

/** Текущее время с периодическим обновлением для подписей «Сегодня»/«Завтра» */
export function useScheduleClockTick(intervalMs = SCHEDULE_CLOCK_TICK_MS): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
