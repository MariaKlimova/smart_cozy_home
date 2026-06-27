import { copy } from '@/copy/ru';
import type { IScenario } from '@/domain/types';

import { getScenarioDefinition } from '../config/scenarios';
import type { TScenarioCardState } from './getScenarioCardState';
import { formatScenarioSchedule } from './formatScenarioSchedule';

interface IFormatScenarioCardSubtitleOptions {
  /** Показывать расписание в idle-состоянии */
  showSchedule?: boolean;
}

/** Подпись под названием сценария с учётом active/prepared */
export function formatScenarioCardSubtitle(
  scenario: IScenario,
  cardState: TScenarioCardState,
  now: Date = new Date(),
  options?: IFormatScenarioCardSubtitleOptions,
): string {
  if (cardState === 'running') {
    if (scenario.id === 'coming_home') {
      return copy.scenarios.preparing;
    }
    return copy.scenarios.running;
  }
  if (cardState === 'active') {
    return copy.scenarios.activeNow;
  }
  if (cardState === 'prepared') {
    return copy.scenarios.prepared;
  }
  if (options?.showSchedule === false) {
    return '';
  }
  const definition = getScenarioDefinition(scenario.id);
  if (definition) {
    return formatScenarioSchedule(definition, now);
  }
  return scenario.scheduleSubtitle;
}
