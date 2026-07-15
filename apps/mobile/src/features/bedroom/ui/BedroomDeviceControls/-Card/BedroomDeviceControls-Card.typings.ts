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
  /** Toggle переключён; false — откатить локальное значение */
  onToggle: (isOn: boolean) => Promise<boolean>;
  /** Сегмент выбран */
  onSegmentSelect: (optionId: string) => void;
  /** Яркость и цвет ночника; false — откатить */
  onColorLightChange?: (brightness: number, colorPresetId: string) => Promise<boolean>;
  /** Открыть выбор устройства в HA */
  onConfigure?: () => void;
}
