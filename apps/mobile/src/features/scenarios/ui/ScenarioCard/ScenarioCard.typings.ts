import type { IScenario } from '@/domain/types';

import type { TScenarioRunState } from '../../lib/useRunScenario';

export interface IScenarioCardProps {
  /** Сценарий для отображения */
  scenario: IScenario;
  /** Transient-состояние запуска */
  runState: TScenarioRunState;
  /** Активный режим из store */
  activeScenarioId: string | null;
  /** Подготовленный сценарий из store */
  preparedScenarioId: string | null;
  /** Запуск / выход / перезапуск */
  onPress: (scenarioId: string) => void;
  /** Переход к настройкам */
  onSettingsPress: (scenarioId: string) => void;
  /** Блокировать запуск другой карточки */
  isAnyRunning: boolean;
  /** На всю ширину (контекстный сценарий на «Сейчас») */
  fullWidth?: boolean;
}
