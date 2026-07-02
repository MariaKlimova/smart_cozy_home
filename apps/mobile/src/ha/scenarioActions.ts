import { loadHomeConfig } from '@/config/homeConfig';
import { getScenarioDefinition } from '@/config/scenarios';
import { runHaScript, setInputSelectOption } from '@/ha/haClient';

/** Запуск сценария через HA script */
export async function runScenario(
  scenarioId: string,
  baseUrl: string,
  token: string,
): Promise<void> {
  const definition = getScenarioDefinition(scenarioId);
  if (!definition) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  await runHaScript(baseUrl, token, definition.script);
}

/** Выход из активного режима — home_mode → none */
export async function exitActiveScenario(baseUrl: string, token: string): Promise<void> {
  const config = loadHomeConfig();
  const { home_mode, exit_home_mode_option } = config.scenarios_ha;
  await setInputSelectOption(baseUrl, token, home_mode.entity, exit_home_mode_option);
}
