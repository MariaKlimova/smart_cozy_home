import type { IScenarioDefinition } from './scenarios.typings';

/** Все сценарии дома в порядке отображения */
export const SCENARIO_DEFINITIONS: IScenarioDefinition[] = [
  {
    id: 'evening',
    label: 'Вечер',
    icon: 'moon-o',
    script: 'script.ritual_evening',
    hasSchedule: true,
    defaultScheduleTime: '22:30',
    kind: 'mode',
    homeModeOption: 'evening',
  },
  {
    id: 'sleep',
    label: 'Сон',
    icon: 'bed',
    script: 'script.ritual_sleep',
    hasSchedule: true,
    defaultScheduleTime: '23:00',
    kind: 'mode',
    homeModeOption: 'sleep',
  },
  {
    id: 'morning',
    label: 'Утро',
    icon: 'sun-o',
    script: 'script.ritual_morning',
    hasSchedule: true,
    defaultScheduleTime: '07:00',
    kind: 'mode',
    homeModeOption: 'morning',
  },
  {
    id: 'away',
    label: 'Уехали',
    icon: 'sign-out',
    script: 'script.ritual_away',
    hasSchedule: false,
    kind: 'mode',
    homeModeOption: 'away',
  },
  {
    id: 'coming_home',
    label: 'Еду домой',
    icon: 'home',
    script: 'script.ritual_coming_home',
    hasSchedule: false,
    kind: 'prepared',
    homeModeOption: 'coming_home',
  },
  {
    id: 'cozy',
    label: 'Уют',
    icon: 'coffee',
    script: 'script.ritual_cozy',
    hasSchedule: false,
    kind: 'mode',
    homeModeOption: 'cozy',
  },
  {
    id: 'focus',
    label: 'Фокус',
    icon: 'laptop',
    script: 'script.ritual_focus',
    hasSchedule: false,
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
