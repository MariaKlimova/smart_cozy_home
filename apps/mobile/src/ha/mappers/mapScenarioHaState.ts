import { loadHomeConfig } from '@/config/homeConfig';
import { resolveModeScenarioIdFromHomeMode } from '@/domain/scenarioRunner';
import type { IPresenceMember } from '@/domain/types';
import type { IHaEntityState } from '@/ha/types';

/** Состояние сценариев из HA */
export interface IScenarioHaState {
  /** id активного режима или null */
  activeScenarioId: string | null;
  /** id сценария подготовки (coming_home) или null */
  preparedScenarioId: string | null;
}

const INACTIVE_HOME_MODE_STATES = new Set(['none', 'off', 'unknown', 'unavailable', '']);

function stateMap(states: IHaEntityState[]): Map<string, IHaEntityState> {
  return new Map(states.map((s) => [s.entityId, s]));
}

/** Маппинг input_select.home_mode и input_boolean подготовки */
export function mapScenarioHaState(
  states: IHaEntityState[],
  presence: IPresenceMember[],
): IScenarioHaState {
  const config = loadHomeConfig();
  const map = stateMap(states);

  let activeScenarioId: string | null = null;
  const homeModeState = map.get(config.scenarios_ha.home_mode.entity);
  if (homeModeState && !INACTIVE_HOME_MODE_STATES.has(homeModeState.state)) {
    activeScenarioId = resolveModeScenarioIdFromHomeMode(homeModeState.state);
  }

  let preparedScenarioId: string | null = null;
  const anyoneHome = presence.some((p) => p.isHome);
  if (!anyoneHome && !activeScenarioId) {
    const preparedState = map.get(config.scenarios_ha.prepared.entity);
    if (preparedState?.state === 'on') {
      preparedScenarioId = 'coming_home';
    }
  }

  return { activeScenarioId, preparedScenarioId };
}
