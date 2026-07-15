import { Switch, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import type { ICalmToggleProps } from './CalmToggle.typings';
import { styles } from './CalmToggle.styles';

export function CalmToggle({
  value,
  onValueChange,
  accessibilityLabel,
  disabled,
  style,
}: ICalmToggleProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.wrap, style]}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        trackColor={{ false: c.border, true: c.accent }}
        thumbColor={value ? c.onAccent : c.surface}
        ios_backgroundColor={c.border}
      />
    </View>
  );
}
