import { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { typography } from '@/theme/tokens';

import type { IScenarioSettingsScreenTextFieldProps } from './ScenarioSettingsScreen-TextField.typings';
import { styles } from './ScenarioSettingsScreen-TextField.styles';

export function ScenarioSettingsScreenTextField({
  label,
  hint,
  setting,
  isPending,
  placeholder,
  onComplete,
}: IScenarioSettingsScreenTextFieldProps) {
  const c = useThemeColors();
  const [localValue, setLocalValue] = useState(setting.value);

  useEffect(() => {
    setLocalValue(setting.value);
  }, [setting.value]);

  async function handleEndEditing() {
    const next = localValue.trim();
    if (next === setting.value) {
      setLocalValue(setting.value);
      return;
    }
    const applied = await onComplete(next);
    if (!applied) {
      setLocalValue(setting.value);
    }
  }

  return (
    <CalmCard padding="md" style={styles.fieldRow}>
      <Text style={[typography.body, { color: c.text }]}>{label}</Text>
      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        onEndEditing={() => {
          void handleEndEditing();
        }}
        editable={setting.isAvailable && !isPending}
        maxLength={setting.maxLength}
        autoCapitalize="sentences"
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            color: c.text,
            borderColor: c.border,
            backgroundColor: c.surface,
          },
        ]}
      />
      {hint ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </CalmCard>
  );
}
