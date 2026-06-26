import { copy } from '@/copy/ru';
import type { IScenario } from '@/domain/types';

import type { TScenarioCardState } from './getScenarioCardState';

/** Подпись под названием сценария с учётом active/prepared */
export function formatScenarioCardSubtitle(
  scenario: IScenario,
  cardState: TScenarioCardState,
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
  return scenario.scheduleSubtitle;
}
