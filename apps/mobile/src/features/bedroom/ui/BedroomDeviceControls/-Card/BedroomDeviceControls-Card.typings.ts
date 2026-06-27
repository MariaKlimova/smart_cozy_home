import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';

export interface IBedroomDeviceControlsCardProps {
  /** Устройство */
  device: IBedroomDeviceState;
  /** Команда в процессе */
  isPending: boolean;
  /** Показывать кнопку настройки привязки */
  showConfigure?: boolean;
  /** Slider отпущен; false — откатить локальное значение */
  onSliderComplete: (value: number) => Promise<boolean>;
  /** Toggle переключён */
  onToggle: (isOn: boolean) => void;
  /** Сегмент выбран */
  onSegmentSelect: (optionId: string) => void;
  /** Открыть выбор устройства в HA */
  onConfigure?: () => void;
}
