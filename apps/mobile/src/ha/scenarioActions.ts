import { loadHomeConfig } from '@/config/homeConfig';
import { getScenarioDefinition } from '@/config/scenarios';
import { runHaScript, setInputSelectOption, stopHaScript } from '@/ha/haClient';

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
 * Выход из активного режима: home_mode → none и остановка script режима.
 * Без stop script длинные sequence (утро) продолжают шаги после «отжима» в UI.
 */
export async function exitActiveScenario(
  baseUrl: string,
  token: string,
  activeScenarioId: string,
): Promise<void> {
  const config = loadHomeConfig();
  const { home_mode, exit_home_mode_option } = config.scenarios_ha;
  await setInputSelectOption(baseUrl, token, home_mode.entity, exit_home_mode_option);
  await stopScenarioScript(activeScenarioId, baseUrl, token);
}
