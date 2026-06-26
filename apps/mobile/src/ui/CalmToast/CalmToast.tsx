import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { CALM_TOAST_FADE_MS } from './CalmToast.const';
import type { ICalmToastProps } from './CalmToast.typings';
import { styles } from './CalmToast.styles';

export function CalmToast({ message, visible, onDismiss }: ICalmToastProps) {
  const c = useThemeColors();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: CALM_TOAST_FADE_MS });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.root, animatedStyle]} pointerEvents="auto">
      <Pressable
        accessibilityRole="alert"
        onPress={onDismiss}
        style={[styles.toast, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <Text style={[typography.body, styles.text, { color: c.text }]}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}
