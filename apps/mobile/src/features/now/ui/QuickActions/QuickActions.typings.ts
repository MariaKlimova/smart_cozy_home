import type { IScenario } from '@/domain/types';
import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';

export interface IQuickActionsProps {
  /** Все сценарии из store */
  scenarios: IScenario[];
  /** id контекстного сценария; null — только ручное управление */
  contextualScenarioId: string | null;
  /** Состояние запуска по id */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим */
  activeScenarioId: string | null;
  /** Подготовленный сценарий */
  preparedScenarioId: string | null;
  /** Запуск сценария */
  onScenarioPress: (scenarioId: string) => void;
  /** Настройки сценария */
  onSettingsPress: (scenarioId: string) => void;
  /** Открыть ручное управление */
  onManualControlPress: () => void;
}
