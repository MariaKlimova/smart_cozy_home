import type { IScenario } from '@/domain/types';

export type TActiveScenarioBannerKind = 'active' | 'prepared';

export interface IActiveScenarioBannerProps {
  /** Сценарий для отображения */
  scenario: IScenario;
  /** Active-режим или подготовка к приезду */
  kind: TActiveScenarioBannerKind;
  /** Идёт запуск / выход */
  isRunning: boolean;
  /** Tap: выход из режима (active) или повтор prepared-сценария */
  onPress: (scenarioId: string) => void;
}
