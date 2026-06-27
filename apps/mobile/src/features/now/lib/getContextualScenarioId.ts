/** Час, с которого контекстный сценарий скрывается до вечера (включительно) */
export const CONTEXTUAL_SCENARIO_DAY_START_HOUR = 11;

/** Час, с которого показываем сценарий «Сон» (включительно) */
export const CONTEXTUAL_SCENARIO_SLEEP_START_HOUR = 21;

/**
 * id контекстного сценария по локальному времени.
 * До 11:00 — утро; 11:00–20:59 — нет; с 21:00 — сон.
 * Алгоритм будет расширяться отдельно.
 */
export function getContextualScenarioId(now: Date = new Date()): string | null {
  const hour = now.getHours();

  if (hour < CONTEXTUAL_SCENARIO_DAY_START_HOUR) {
    return 'morning';
  }

  if (hour < CONTEXTUAL_SCENARIO_SLEEP_START_HOUR) {
    return null;
  }

  return 'sleep';
}
