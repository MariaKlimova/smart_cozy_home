import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import type { ICalmButtonProps } from '@/ui/CalmButton/CalmButton.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { touchMin, typography } from '@/theme/tokens';

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

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? c.accent : 'transparent',
          borderColor: c.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : c.accent} />
      ) : (
        <Text
          style={[
            typography.subtitle,
            { color: isPrimary ? '#FFFFFF' : c.text },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchMin,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
