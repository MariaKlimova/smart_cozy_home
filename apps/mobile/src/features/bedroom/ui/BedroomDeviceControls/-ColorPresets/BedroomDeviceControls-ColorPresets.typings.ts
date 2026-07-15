import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';

export interface IBedroomDeviceControlsColorPresetsProps {
  /** Пресеты из HA favorites */
  presets: INightlightColorPreset[];
  /** id активного пресета */
  activePresetId?: string;
  /** Выключен (нет яркости / unavailable / pending) */
  disabled: boolean;
  /** Выбор пресета */
  onSelect: (presetId: string) => void;
}
