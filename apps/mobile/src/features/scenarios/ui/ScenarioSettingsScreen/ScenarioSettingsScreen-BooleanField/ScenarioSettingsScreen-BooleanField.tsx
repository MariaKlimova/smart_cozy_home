import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { CalmToggle } from '@/ui/CalmToggle';
import { typography } from '@/theme/tokens';

import type { IScenarioSettingsScreenBooleanFieldProps } from './ScenarioSettingsScreen-BooleanField.typings';
import { styles } from './ScenarioSettingsScreen-BooleanField.styles';

export function ScenarioSettingsScreenBooleanField({
  label,
  value,
  disabled,
  onChange,
}: IScenarioSettingsScreenBooleanFieldProps) {
  const c = useThemeColors();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  async function handleChange(next: boolean) {
    setLocalValue(next);
    const applied = await onChange(next);
    if (!applied) {
      setLocalValue(value);
    }
  }

  return (
    <CalmCard padding="md">
      <View style={styles.row}>
        <Text style={[typography.body, { color: c.text }]}>{label}</Text>
        <CalmToggle
          value={localValue}
          disabled={disabled}
          accessibilityLabel={label}
          onValueChange={handleChange}
        />
      </View>
    </CalmCard>
  );
}
