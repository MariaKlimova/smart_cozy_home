import type { TScenarioRunState } from './useRunScenario';

/** Визуальное состояние карточки сценария */
export type TScenarioCardState = 'idle' | 'running' | 'active' | 'prepared';

/** Собрать состояние карточки из transient run и HA-sync */
export function getScenarioCardState(
  scenarioId: string,
  runState: TScenarioRunState,
  activeScenarioId: string | null,
  preparedScenarioId: string | null,
): TScenarioCardState {
  if (runState === 'running') {
    return 'running';
  }
  if (activeScenarioId === scenarioId) {
    return 'active';
  }
  if (preparedScenarioId === scenarioId) {
    return 'prepared';
  }
  return 'idle';
}
