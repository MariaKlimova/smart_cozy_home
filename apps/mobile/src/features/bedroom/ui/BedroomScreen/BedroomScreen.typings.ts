import type { TBedroomTabId } from './BedroomScreen.const';

export interface IBedroomScreenProps {
  /** Начальная вкладка из deep link */
  initialTab?: TBedroomTabId;
}
