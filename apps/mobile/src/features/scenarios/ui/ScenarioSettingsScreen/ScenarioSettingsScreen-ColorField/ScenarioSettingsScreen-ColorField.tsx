import { Pressable, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { typography } from '@/theme/tokens';

import {
  LIGHT_SWATCH_LUMINANCE_THRESHOLD,
  SCENARIO_SETTINGS_SCREEN_COLOR_FIELD_NAME,
} from './ScenarioSettingsScreen-ColorField.const';
import type { IScenarioSettingsScreenColorFieldProps } from './ScenarioSettingsScreen-ColorField.typings';
import { styles } from './ScenarioSettingsScreen-ColorField.styles';

function needsBorder(rgb: [number, number, number]): boolean {
  const luminance = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return luminance >= LIGHT_SWATCH_LUMINANCE_THRESHOLD;
}

export function ScenarioSettingsScreenColorField({
  label,
  setting,
  isPending,
  onSelect,
}: IScenarioSettingsScreenColorFieldProps) {
  const c = useThemeColors();

  if (!setting.isAvailable || setting.colorPresets.length === 0) {
    return null;
  }

  const isDisabled = isPending;

  return (
    <CalmCard padding="md" style={styles.fieldRow}>
      <Text style={[typography.body, { color: c.text }]}>{label}</Text>
      <View
        style={styles.row}
        testID={SCENARIO_SETTINGS_SCREEN_COLOR_FIELD_NAME}
        accessibilityRole="radiogroup"
      >
        {setting.colorPresets.map((preset, index) => {
          const selected = preset.id === setting.colorPresetId;
          const [r, g, b] = preset.displayRgb;
          const backgroundColor = `rgb(${r}, ${g}, ${b})`;
          const bordered = needsBorder(preset.displayRgb);

          return (
            <Pressable
              key={preset.id}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: isDisabled }}
              accessibilityLabel={copy.bedroom.colorPresetA11y.replace('{index}', String(index + 1))}
              disabled={isDisabled}
              onPress={() => {
                void onSelect(preset.color);
              }}
              style={[
                styles.swatch,
                { backgroundColor, opacity: isDisabled ? 0.4 : 1 },
                bordered ? [styles.swatchBordered, { borderColor: c.border }] : null,
                selected ? [styles.swatchSelected, { borderColor: c.accent }] : null,
              ]}
            />
          );
        })}
      </View>
    </CalmCard>
  );
}
