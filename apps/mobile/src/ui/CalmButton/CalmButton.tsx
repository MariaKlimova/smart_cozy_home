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
  const isGhost = variant === 'ghost';

  let backgroundColor: string = 'transparent';
  if (isPrimary) {
    backgroundColor = c.accent;
  }

  let borderWidth = 0;
  if (isSecondary) {
    borderWidth = 1;
  }

  let textColor: string = c.text;
  if (isPrimary) {
    textColor = CALM_BUTTON_PRIMARY_TEXT;
  } else if (isGhost) {
    textColor = c.accent;
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor: c.border,
          borderWidth,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? CALM_BUTTON_PRIMARY_TEXT : c.accent} />
      ) : (
        <Text style={[typography.subtitle, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}
