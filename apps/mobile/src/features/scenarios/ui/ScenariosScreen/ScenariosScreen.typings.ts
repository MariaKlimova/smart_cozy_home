import type { IScenario } from '@/domain/types';

import type { TScenarioRunState } from '../../lib/useRunScenario';

export interface IScenariosScreenProps {
  /** Список сценариев */
  scenarios: IScenario[];
  /** Состояние запуска по id */
  runStateById: Record<string, TScenarioRunState>;
  /** Активный режим */
  activeScenarioId: string | null;
  /** Подготовленный сценарий */
  preparedScenarioId: string | null;
  /** Текст ошибки для toast */
  lastError: string | null;
  /** Запуск сценария */
  onScenarioPress: (scenarioId: string) => void;
  /** Переход к настройкам */
  onSettingsPress: (scenarioId: string) => void;
  /** Сбросить toast */
  onDismissError: () => void;
}
