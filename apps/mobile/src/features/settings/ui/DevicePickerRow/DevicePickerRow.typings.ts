import type { IHaEntityListItem } from '@/domain/haEntityList.typings';

/** Пропсы строки выбора устройства */
export interface IDevicePickerRowProps {
  /** Entity из HA */
  item: IHaEntityListItem;
  /** Выбор строки */
  onPress: () => void;
}
