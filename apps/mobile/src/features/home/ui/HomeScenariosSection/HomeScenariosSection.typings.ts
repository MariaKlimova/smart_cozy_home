import type { IScenario } from '@/domain/types';

import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';

export interface IHomeScenariosSectionProps {
  /** Все сценарии из store */
  scenarios: IScenario[];
  /** Состояние запуска по id */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим */
  activeScenarioId: string | null;
  /** Подготовленный сценарий */
  preparedScenarioId: string | null;
  /** Запуск сценария */
  onScenarioPress: (scenarioId: string) => void;
  /** Переход к настройкам */
  onSettingsPress: (scenarioId: string) => void;
}
