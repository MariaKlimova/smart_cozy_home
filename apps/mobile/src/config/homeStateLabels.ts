import { copy } from '@/copy/ru';
import type { LifeState } from '@/domain/types';

/** Заголовок домашнего экрана по life state */
export function titleForLifeState(lifeState: LifeState): string {
  switch (lifeState) {
    case 'morning':
      return 'Доброе утро';
    case 'evening':
      return 'Спокойный вечер';
    case 'sleep':
      return 'Время отдыха';
    case 'away':
      return copy.home.awayTitle;
    case 'guests':
      return copy.home.guestsTitle;
    case 'work':
      return 'Рабочий ритм';
    case 'rest':
    default:
      return copy.home.defaultTitle;
  }
}
