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
  /** Toggle переключён; false, если команда не применилась */
  onToggle: (deviceId: string, isOn: boolean) => Promise<boolean>;
  /** Сегмент выбран */
  onSegmentSelect: (deviceId: string, optionId: string) => void;
  /** Яркость и цвет ночника */
  onColorLightChange?: (
    deviceId: string,
    brightness: number,
    colorPresetId: string,
  ) => Promise<boolean>;
  /** Порог «свет виден с» для основного света */
  onVisibleMinComplete?: (value: number) => Promise<boolean>;
  /** Настроить привязку устройства к HA */
  onConfigureDevice?: (deviceId: string) => void;
}
