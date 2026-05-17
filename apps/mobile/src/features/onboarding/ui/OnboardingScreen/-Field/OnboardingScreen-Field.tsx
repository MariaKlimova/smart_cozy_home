import { Text, TextInput, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IOnboardingScreenFieldProps } from './OnboardingScreen-Field.typings';
import { styles } from './OnboardingScreen-Field.styles';

export function OnboardingScreenField({
  label,
  value,
  onChangeText,
  secure,
  placeholder,
  onFocus,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType,
  autoComplete,
  inputRef,
}: IOnboardingScreenFieldProps) {
  const c = useThemeColors();

  return (
    <View style={styles.field}>
      <Text style={[typography.caption, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholder={placeholder}
        onFocus={onFocus}
        keyboardType={keyboardType}
        textContentType={textContentType}
        autoComplete={autoComplete}
        style={[
          styles.input,
          {
            color: c.text,
            borderColor: c.border,
            backgroundColor: c.surface,
          },
        ]}
        placeholderTextColor={c.textMuted}
      />
    </View>
  );
}
