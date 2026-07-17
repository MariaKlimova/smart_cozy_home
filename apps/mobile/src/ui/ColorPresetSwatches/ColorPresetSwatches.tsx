import { Pressable, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';

import {
  COLOR_PRESET_SWATCHES_NAME,
  LIGHT_SWATCH_LUMINANCE_THRESHOLD,
} from './ColorPresetSwatches.const';
import type { IColorPresetSwatchesProps } from './ColorPresetSwatches.typings';
import { styles } from './ColorPresetSwatches.styles';

function needsBorder(rgb: [number, number, number]): boolean {
  const luminance = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return luminance >= LIGHT_SWATCH_LUMINANCE_THRESHOLD;
}

export function ColorPresetSwatches({
  presets,
  activePresetId,
  disabled,
  onSelect,
  testID = COLOR_PRESET_SWATCHES_NAME,
}: IColorPresetSwatchesProps) {
  const c = useThemeColors();

  if (presets.length === 0) {
    return null;
  }

  return (
    <View style={styles.row} testID={testID} accessibilityRole="radiogroup">
      {presets.map((preset, index) => {
        const selected = preset.id === activePresetId;
        const [r, g, b] = preset.displayRgb;
        const backgroundColor = `rgb(${r}, ${g}, ${b})`;
        const bordered = needsBorder(preset.displayRgb);

        return (
          <Pressable
            key={preset.id}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={copy.bedroom.colorPresetA11y.replace('{index}', String(index + 1))}
            disabled={disabled}
            onPress={() => onSelect(preset.id)}
            style={[
              styles.swatch,
              { backgroundColor, opacity: disabled ? 0.4 : 1 },
              bordered ? [styles.swatchBordered, { borderColor: c.border }] : null,
              selected ? [styles.swatchSelected, { borderColor: c.accent }] : null,
            ]}
          />
        );
      })}
    </View>
  );
}
