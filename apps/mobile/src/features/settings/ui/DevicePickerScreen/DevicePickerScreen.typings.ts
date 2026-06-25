import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';

/** Пропсы экрана выбора устройства */
export interface IDevicePickerScreenProps {
  /** Слот устройства */
  slot: TBedroomDeviceSlot;
}
