import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';

/** Пропсы слота датчика */
export interface IBedroomSensorSlotProps {
  /** Слот */
  slot: TBedroomSensorSlot;
  /** Подпись слота */
  label: string;
  /** Имя устройства в HA */
  deviceName: string | null;
  /** Превью значения */
  preview: string | null;
  /** Слот не выбран */
  isUnset: boolean;
  /** Слот отключён */
  isDisabled: boolean;
  /** Нажатие «Изменить» */
  onChange: () => void;
  /** Нажатие «Не использовать» */
  onClear: () => void;
}
