import { loadHomeConfig } from '@/config/homeConfig';
import {
  SCENARIO_DEFINITIONS,
  getScenarioDefinition,
} from '@/features/scenarios/config/scenarios';
import { formatScenarioSchedule } from '@/features/scenarios/lib/formatScenarioSchedule';
import { runHaScript, setInputSelectOption } from '@/ha/haClient';
import type { IScenario } from '@/domain/types';

/** Список сценариев для UI */
export function listScenarios(): IScenario[] {
  return SCENARIO_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    icon: definition.icon,
    hasSchedule: definition.hasSchedule,
    scheduleSubtitle: formatScenarioSchedule(definition),
  }));
}

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
