import { Pressable, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import type { ICalmSegmentedProps } from './CalmSegmented.typings';
import { styles } from './CalmSegmented.styles';

export function CalmSegmented({
  options,
  value,
  onValueChange,
  disabled,
  style,
}: ICalmSegmentedProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.row, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.id === value;

        let backgroundColor: string = c.surface;
        if (isActive) {
          backgroundColor = c.accentMuted;
        }

        let textColor: string = c.textMuted;
        if (isActive) {
          textColor = c.text;
        }

        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled }}
            disabled={disabled}
            onPress={() => onValueChange(option.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor,
                borderColor: isActive ? c.accent : c.border,
                opacity: pressed && !disabled ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.chipLabel, { color: textColor }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
