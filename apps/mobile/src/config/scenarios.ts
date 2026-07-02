import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { copy } from '@/copy/ru';

import type { IScenarioDefinition } from './scenarios.typings';

const { scripts } = HA_ENTITIES;
const SCENARIO_NAMES = copy.scenarios.names as Record<string, string>;

/** Все сценарии дома в порядке отображения */
export const SCENARIO_DEFINITIONS: IScenarioDefinition[] = [
  {
    id: 'evening',
    label: SCENARIO_NAMES.evening,
    icon: 'moon-o',
    script: scripts.evening,
    hasSchedule: true,
    defaultScheduleTime: '22:30',
    kind: 'mode',
    homeModeOption: 'evening',
  },
  {
    id: 'sleep',
    label: SCENARIO_NAMES.sleep,
    icon: 'bed',
    script: scripts.sleep,
    hasSchedule: true,
    defaultScheduleTime: '23:00',
    kind: 'mode',
    homeModeOption: 'sleep',
  },
  {
    id: 'morning',
    label: SCENARIO_NAMES.morning,
    icon: 'sun-o',
    script: scripts.morning,
    hasSchedule: true,
    defaultScheduleTime: '07:00',
    kind: 'mode',
    homeModeOption: 'morning',
  },
  {
    id: 'away',
    label: SCENARIO_NAMES.away,
    icon: 'sign-out',
    script: scripts.away,
    hasSchedule: true,
    defaultScheduleTime: '08:00',
    kind: 'mode',
    homeModeOption: 'away',
  },
  {
    id: 'coming_home',
    label: SCENARIO_NAMES.coming_home,
    icon: 'home',
    script: scripts.comingHome,
    hasSchedule: true,
    defaultScheduleTime: '18:00',
    kind: 'prepared',
    homeModeOption: 'coming_home',
  },
  {
    id: 'cozy',
    label: SCENARIO_NAMES.cozy,
    icon: 'coffee',
    script: scripts.cozy,
    hasSchedule: true,
    defaultScheduleTime: '20:00',
    kind: 'mode',
    homeModeOption: 'cozy',
  },
  {
    id: 'focus',
    label: SCENARIO_NAMES.focus,
    icon: 'laptop',
    script: scripts.focus,
    hasSchedule: true,
    defaultScheduleTime: '09:00',
    kind: 'mode',
    homeModeOption: 'focus',
  },
];

/** Lookup сценария по id */
export function getScenarioDefinition(id: string): IScenarioDefinition | undefined {
  return SCENARIO_DEFINITIONS.find((s) => s.id === id);
}

/** Lookup сценария по option input_select.home_mode */
export function getScenarioByHomeModeOption(option: string): IScenarioDefinition | undefined {
  return SCENARIO_DEFINITIONS.find((s) => s.homeModeOption === option);
}
