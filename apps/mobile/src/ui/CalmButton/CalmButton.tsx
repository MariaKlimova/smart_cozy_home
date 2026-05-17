import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { CALM_BUTTON_PRIMARY_TEXT } from './CalmButton.const';
import type { ICalmButtonProps } from './CalmButton.typings';
import { styles } from './CalmButton.styles';

export function CalmButton({
  label,
  variant = 'primary',
  isLoading,
  disabled,
  style,
  ...rest
}: ICalmButtonProps) {
  const c = useThemeColors();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? c.accent : 'transparent',
          borderColor: c.border,
          borderWidth: isSecondary ? 1 : 0,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? CALM_BUTTON_PRIMARY_TEXT : c.accent} />
      ) : (
        <Text
          style={[
            typography.subtitle,
            { color: isPrimary ? CALM_BUTTON_PRIMARY_TEXT : c.text },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
