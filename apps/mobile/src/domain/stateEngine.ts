import { titleForLifeState } from '@/config/homeStateLabels';
import {
  isEveningTime,
  isMorningTime,
  isNightTime,
} from '@/domain/nightSchedule';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import type { IHomeMetric, IHomeState, IPresenceMember, LifeState } from '@/domain/types';

export interface IStateEngineInput {
  /** Текущий момент */
  now: Date;
  /** Границы ночи пользователя */
  nightSchedule: INightSchedule;
  /** Кто дома */
  presence: IPresenceMember[];
  /** id активного сценария-режима или undefined */
  activeScenarioId?: string;
  /** @deprecated Используй activeScenarioId */
  activeRitualId?: string;
  /** Температура для метрики */
  temperature?: string;
  /** Сколько светильников включено из отслеживаемых */
  lightsOnCount?: number;
  /** lights total */
  lightsTotal?: number;
  /** Безопасность: ok | attention */
  securityStatus?: 'ok' | 'attention';
}

function resolveLifeState(input: IStateEngineInput): LifeState {
  const anyoneHome = input.presence.some((p) => p.isHome);
  const activeId = input.activeScenarioId ?? input.activeRitualId;
  const { now, nightSchedule } = input;

  if (!anyoneHome || activeId === 'away') return 'away';
  if (activeId === 'sleep') return 'sleep';
  if (activeId === 'evening') return 'evening';
  if (activeId === 'morning') return 'morning';
  if (activeId === 'focus') return 'work';
  if (isNightTime(now, nightSchedule)) return 'sleep';
  if (isMorningTime(now, nightSchedule)) return 'morning';
  if (isEveningTime(now, nightSchedule)) return 'evening';
  if (now.getHours() >= 11 && now.getHours() < 18) return 'work';
  return 'rest';
}

function hintForLifeState(lifeState: LifeState, presence: IPresenceMember[]): string {
  const homeNames = presence.filter((p) => p.isHome).map((p) => p.label);
  if (lifeState === 'away') {
    return 'Всё под контролем, пока тебя нет.';
  }
  if (homeNames.length > 0) {
    return `${homeNames.join(' и ')} ${homeNames.length === 1 ? 'дома' : 'дома'}. Дом в спокойном режиме.`;
  }
  return 'Дом в спокойном режиме.';
}

export function computeHomeState(input: IStateEngineInput): IHomeState {
  const lifeState = resolveLifeState(input);
  const metrics: IHomeMetric[] = [];

  if (input.temperature) {
    metrics.push({ id: 'temp', label: 'Температура', value: input.temperature });
  }

  if (input.lightsTotal !== undefined && input.lightsOnCount !== undefined) {
    const value =
      input.lightsOnCount === 0
        ? 'Свет выключен'
        : `${input.lightsOnCount} из ${input.lightsTotal} включено`;
    metrics.push({ id: 'light', label: 'Свет', value });
  }

  const securityLabel = input.securityStatus === 'attention' ? 'Проверь замки' : 'Всё спокойно';
  metrics.push({ id: 'security', label: 'Безопасность', value: securityLabel });

  return {
    title: titleForLifeState(lifeState),
    lifeState,
    hint: hintForLifeState(lifeState, input.presence),
    metrics,
  };
}
