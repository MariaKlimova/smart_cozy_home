import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '@/copy/ru';
import { getScenarioHighlightColors } from '@/features/scenarios/lib/getScenarioHighlightColors';
import { useThemeColors } from '@/hooks/useThemeColors';

import {
  ACTIVE_SCENARIO_BANNER,
  ACTIVE_SCENARIO_BANNER_EXIT_FADE_MS,
  ACTIVE_SCENARIO_BANNER_ICON_SIZE,
  ACTIVE_SCENARIO_BANNER_POWER_ICON_SIZE,
  ACTIVE_SCENARIO_BANNER_PRESS_MS,
  ACTIVE_SCENARIO_BANNER_PRESS_SCALE,
} from './ActiveScenarioBanner.const';
import type { IActiveScenarioBannerProps } from './ActiveScenarioBanner.typings';
import { styles } from './ActiveScenarioBanner.styles';

export function ActiveScenarioBanner({
  scenario,
  kind,
  isRunning,
  onPress,
}: IActiveScenarioBannerProps) {
  const c = useThemeColors();
  const isActive = kind === 'active';
  const { backgroundColor, borderColor, iconColor } = getScenarioHighlightColors(c, kind);
  const caption = isActive ? copy.scenarios.activeNow : copy.scenarios.prepared;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isExiting = useSharedValue(false);

  let accessibilityLabel = copy.now.preparedScenarioA11y.replace('{label}', scenario.label);
  if (isActive) {
    accessibilityLabel = copy.now.activeScenarioExitA11y.replace('{label}', scenario.label);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isRunning) {
      return;
    }
    isExiting.value = false;
    scale.value = 1;
    opacity.value = 1;
  }, [isRunning, isExiting, opacity, scale]);

  const invokePress = useCallback(() => {
    onPress(scenario.id);
  }, [onPress, scenario.id]);

  const handlePressIn = useCallback(() => {
    if (isActive || isRunning || isExiting.value) {
      return;
    }
    scale.value = withTiming(ACTIVE_SCENARIO_BANNER_PRESS_SCALE, {
      duration: ACTIVE_SCENARIO_BANNER_PRESS_MS,
    });
  }, [isActive, isExiting, isRunning, scale]);

  const handlePressOut = useCallback(() => {
    if (isActive || isRunning || isExiting.value) {
      return;
    }
    scale.value = withTiming(1, { duration: ACTIVE_SCENARIO_BANNER_PRESS_MS });
  }, [isActive, isExiting, isRunning, scale]);

  const handlePress = useCallback(() => {
    if (isRunning || isExiting.value) {
      return;
    }
    if (!isActive) {
      invokePress();
      return;
    }
    isExiting.value = true;
    scale.value = withTiming(ACTIVE_SCENARIO_BANNER_PRESS_SCALE, {
      duration: ACTIVE_SCENARIO_BANNER_EXIT_FADE_MS,
    });
    opacity.value = withTiming(0, { duration: ACTIVE_SCENARIO_BANNER_EXIT_FADE_MS }, (finished) => {
      if (finished) {
        runOnJS(invokePress)();
      }
    });
  }, [invokePress, isActive, isExiting, isRunning, opacity, scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={ACTIVE_SCENARIO_BANNER}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: true, busy: isRunning }}
        disabled={isRunning}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.root, { backgroundColor, borderColor }]}
      >
        <View style={styles.iconSlot}>
          {isRunning ? (
            <ActivityIndicator color={iconColor} size="small" />
          ) : (
            <FontAwesome
              name={scenario.icon as 'moon-o'}
              size={ACTIVE_SCENARIO_BANNER_ICON_SIZE}
              color={iconColor}
            />
          )}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: c.text }]}>{scenario.label}</Text>
          <Text style={[styles.caption, { color: iconColor }]}>{caption}</Text>
        </View>
        {isActive ? (
          <View
            style={[styles.powerSlot, { backgroundColor: c.surface }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <FontAwesome
              name="power-off"
              size={ACTIVE_SCENARIO_BANNER_POWER_ICON_SIZE}
              color={c.accent}
            />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
