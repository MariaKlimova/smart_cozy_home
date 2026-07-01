import { loadHomeConfig } from '@/config/homeConfig';
import {
  SCENARIO_DEFINITIONS,
  getScenarioDefinition,
  getScenarioByHomeModeOption,
} from '@/config/scenarios';
import { formatScenarioSchedule } from '@/config/formatScenarioSchedule';
import type { IScenarioScheduleState } from '@/domain/scenarioSettings.typings';
import type { IScenario } from '@/domain/types';
import { runHaScript, setInputSelectOption } from '@/ha/haClient';

/** id режима по option input_select.home_mode */
export function resolveModeScenarioIdFromHomeMode(option: string): string | null {
  const definition = getScenarioByHomeModeOption(option);
  if (definition?.kind === 'mode') {
    return definition.id;
  }
  return null;
}

/** Список сценариев для UI */
export function listScenarios(
  now: Date = new Date(),
  schedules?: Record<string, IScenarioScheduleState>,
): IScenario[] {
  return SCENARIO_DEFINITIONS.map((definition) => {
    const schedule = schedules?.[definition.id];
    return {
      id: definition.id,
      label: definition.label,
      icon: definition.icon,
      hasSchedule: definition.hasSchedule,
      schedule,
      scheduleSubtitle: formatScenarioSchedule(definition, schedule, now),
    };
  });
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
