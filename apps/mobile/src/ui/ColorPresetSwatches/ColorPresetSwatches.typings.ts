import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';

export interface IColorPresetSwatchesProps {
  /** Пресеты для swatch-ряда */
  presets: INightlightColorPreset[];
  /** id активного пресета */
  activePresetId?: string;
  /** Выключен (unavailable / pending) */
  disabled: boolean;
  /** Выбор пресета по id */
  onSelect: (presetId: string) => void;
  /** testID корневого контейнера */
  testID?: string;
}
