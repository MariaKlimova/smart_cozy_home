import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { CalmSlider } from '@/ui/CalmSlider';
import { typography } from '@/theme/tokens';

import type { IScenarioSettingsScreenNumberFieldProps } from './ScenarioSettingsScreen-NumberField.typings';
import { styles } from './ScenarioSettingsScreen-NumberField.styles';

function formatNumberValue(value: number, unit?: string): string {
  if (unit) {
    return `${value} ${unit}`;
  }
  return String(value);
}

export function ScenarioSettingsScreenNumberField({
  label,
  setting,
  isPending,
  onComplete,
}: IScenarioSettingsScreenNumberFieldProps) {
  const c = useThemeColors();
  const [localValue, setLocalValue] = useState(setting.value);

  useEffect(() => {
    setLocalValue(setting.value);
  }, [setting.value]);

  async function handleComplete(value: number) {
    const applied = await onComplete(value);
    if (!applied) {
      setLocalValue(setting.value);
    }
  }

  return (
    <CalmCard padding="md" style={styles.fieldRow}>
      <View style={styles.fieldHeader}>
        <Text style={[typography.body, { color: c.text }]}>{label}</Text>
        <Text style={[typography.caption, styles.fieldValue, { color: c.textMuted }]}>
          {formatNumberValue(localValue, setting.unit)}
        </Text>
      </View>
      <CalmSlider
        value={localValue}
        minimumValue={setting.min}
        maximumValue={setting.max}
        step={setting.step}
        disabled={!setting.isAvailable || isPending}
        accessibilityLabel={label}
        onValueChange={setLocalValue}
        onSlidingComplete={handleComplete}
      />
    </CalmCard>
  );
}
