import { Text } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { ColorPresetSwatches } from '@/ui/ColorPresetSwatches';
import { typography } from '@/theme/tokens';

import { SCENARIO_SETTINGS_SCREEN_COLOR_FIELD_NAME } from './ScenarioSettingsScreen-ColorField.const';
import type { IScenarioSettingsScreenColorFieldProps } from './ScenarioSettingsScreen-ColorField.typings';
import { styles } from './ScenarioSettingsScreen-ColorField.styles';

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

  return (
    <CalmCard padding="md" style={styles.fieldRow}>
      <Text style={[typography.body, { color: c.text }]}>{label}</Text>
      <ColorPresetSwatches
        presets={setting.colorPresets}
        activePresetId={setting.colorPresetId}
        disabled={isPending}
        testID={SCENARIO_SETTINGS_SCREEN_COLOR_FIELD_NAME}
        onSelect={(presetId) => {
          const preset = setting.colorPresets.find((item) => item.id === presetId);
          if (!preset) return;
          void onSelect(preset.color);
        }}
      />
    </CalmCard>
  );
}
