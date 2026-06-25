/** id вкладки экрана спальни */
export type TBedroomTabId = 'devices' | 'sensors';

/** Локальные константы блока */
export const BEDROOM_SCREEN_BLOCK_NAME = 'BedroomScreen' as const;

export const BEDROOM_TAB_OPTIONS: { id: TBedroomTabId; labelKey: 'devices' | 'sensors' }[] = [
  { id: 'devices', labelKey: 'devices' },
  { id: 'sensors', labelKey: 'sensors' },
];
