import type { IHaEntityListItem } from '@/ha/entityList';

/** Пропсы строки выбора устройства */
export interface IDevicePickerRowProps {
  /** Entity из HA */
  item: IHaEntityListItem;
  /** Выбор строки */
  onPress: () => void;
}
