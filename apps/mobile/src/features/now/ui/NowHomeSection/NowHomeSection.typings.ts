import type { IScenario } from '@/domain/types';
import type { INowSuggestion } from '@/domain/nowSuggestion.typings';
import type { TScenarioRunState } from '@/features/scenarios/lib/useRunScenario';

export interface INowHomeSectionProps {
  /** Primary action */
  suggestion: INowSuggestion;
  /** Сценарии дома */
  scenarios: IScenario[];
  /** Состояние запуска сценариев */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим */
  activeScenarioId: string | null;
  /** Подготовленный сценарий */
  preparedScenarioId: string | null;
  /** Запуск сценария */
  onScenarioPress: (scenarioId: string) => Promise<void>;
  /** Настройки сценария */
  onSettingsPress: (scenarioId: string) => void;
  /** Ручное управление */
  onManualControlPress: () => void;
  /** Device primary action */
  onDeviceActionPress: () => Promise<void>;
  /** Идёт device action */
  isDeviceActionRunning: boolean;
}
