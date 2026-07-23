import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { getScenarioDefinition } from '@/config/scenarios';
import { runHaScript, stopHaScript } from '@/ha/haClient';

/** Остановить HA-script сценария, если он ещё выполняется (ramp/delay) */
export async function stopScenarioScript(
  scenarioId: string,
  baseUrl: string,
  token: string,
): Promise<void> {
  const definition = getScenarioDefinition(scenarioId);
  if (!definition) {
    return;
  }
  await stopHaScript(baseUrl, token, definition.script);
}

/** Запуск сценария через HA script */
export async function runScenario(
  scenarioId: string,
  baseUrl: string,
  token: string,
  options?: {
    /**
     * id режима, который был active до запуска — его script останавливаем,
     * чтобы длинный ramp (утро) не продолжался поверх нового сценария.
     */
    stopActiveScenarioId?: string | null;
  },
): Promise<void> {
  const definition = getScenarioDefinition(scenarioId);
  if (!definition) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  const previousId = options?.stopActiveScenarioId;
  if (previousId && previousId !== scenarioId) {
    await stopScenarioScript(previousId, baseUrl, token);
  }

  await runHaScript(baseUrl, token, definition.script);
}

/**
 * Выход из активного режима: тот же script.exit_home_mode, что и голос Алисы
 * (home_mode → none, stop scripts режимов, стоп музыки на станции).
 */
export async function exitActiveScenario(baseUrl: string, token: string): Promise<void> {
  await runHaScript(baseUrl, token, HA_ENTITIES.scripts.exitHomeMode);
}
