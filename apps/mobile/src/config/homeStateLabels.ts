import { copy } from '@/copy/ru';
import type { LifeState } from '@/domain/types';

const LIFE_STATE_TITLES = copy.home.lifeStateTitles as Record<LifeState, string>;

/** Заголовок домашнего экрана по life state */
export function titleForLifeState(lifeState: LifeState): string {
  return LIFE_STATE_TITLES[lifeState] ?? LIFE_STATE_TITLES.rest;
}
