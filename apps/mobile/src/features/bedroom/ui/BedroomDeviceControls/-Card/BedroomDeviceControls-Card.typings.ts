import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';

export interface IBedroomDeviceControlsCardProps {
  /** Устройство */
  device: IBedroomDeviceState;
  /** Команда в процессе */
  isPending: boolean;
  /** Slider отпущен */
  onSliderComplete: (value: number) => void;
  /** Toggle переключён */
  onToggle: (isOn: boolean) => void;
  /** Сегмент выбран */
  onSegmentSelect: (optionId: string) => void;
  /** Открыть выбор устройства в HA */
  onConfigure: () => void;
}
