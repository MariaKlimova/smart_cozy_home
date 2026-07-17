import { ColorPresetSwatches } from '@/ui/ColorPresetSwatches';

import { BEDROOM_DEVICE_CONTROLS_COLOR_PRESETS_NAME } from './BedroomDeviceControls-ColorPresets.const';
import type { IBedroomDeviceControlsColorPresetsProps } from './BedroomDeviceControls-ColorPresets.typings';

export function BedroomDeviceControlsColorPresets({
  presets,
  activePresetId,
  disabled,
  onSelect,
}: IBedroomDeviceControlsColorPresetsProps) {
  return (
    <ColorPresetSwatches
      presets={presets}
      activePresetId={activePresetId}
      disabled={disabled}
      onSelect={onSelect}
      testID={BEDROOM_DEVICE_CONTROLS_COLOR_PRESETS_NAME}
    />
  );
}
