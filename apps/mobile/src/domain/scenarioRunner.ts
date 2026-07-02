import {
  SCENARIO_DEFINITIONS,
  getScenarioByHomeModeOption,
} from '@/config/scenarios';
import { formatScenarioSchedule } from '@/config/formatScenarioSchedule';
import type { IScenarioScheduleState } from '@/domain/scenarioSettings.typings';
import type { IScenario } from '@/domain/types';

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
