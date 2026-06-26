import type { IBedroomDeviceState } from '@/domain/bedroomDevice.typings';

export interface IBedroomDeviceControlsProps {
  /** Устройства спальни */
  devices: IBedroomDeviceState[];
  /** id устройства с активной командой */
  pendingDeviceId?: string;
  /** Показывать кнопку настройки привязки */
  showConfigure?: boolean;
  /** Slider отпущен — отправить в HA; false, если команда не применилась */
  onSliderComplete: (deviceId: string, value: number) => Promise<boolean>;
  /** Toggle переключён */
  onToggle: (deviceId: string, isOn: boolean) => void;
  /** Сегмент выбран */
  onSegmentSelect: (deviceId: string, optionId: string) => void;
  /** Настроить привязку устройства к HA */
  onConfigureDevice?: (deviceId: string) => void;
}
