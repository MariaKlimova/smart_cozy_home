import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '@/copy/ru';
import { getScenarioCardState } from '@/features/scenarios/lib/getScenarioCardState';
import { getScenarioHighlightColors } from '@/features/scenarios/lib/getScenarioHighlightColors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import {
  SCENARIO_CARD_ICON_SIZE,
  SCENARIO_CARD_PULSE_MS,
  SCENARIO_CARD_PULSE_SCALE,
  SCENARIO_CARD_SETTINGS_HIT_SLOP,
} from './ScenarioCard.const';
import type { IScenarioCardProps } from './ScenarioCard.typings';
import { styles } from './ScenarioCard.styles';

function scenarioRunAccessibilityLabel(
  label: string,
  isRunning: boolean,
  isActive: boolean,
  isPrepared: boolean,
): string {
  if (isRunning) {
    return `${label}. ${copy.scenarios.running}`;
  }
  if (isActive) {
    return `${label}. ${copy.scenarios.activeNow}`;
  }
  if (isPrepared) {
    return `${label}. ${copy.scenarios.prepared}`;
  }
  return label;
}

export function ScenarioCard({
  scenario,
  runState,
  activeScenarioId,
  preparedScenarioId,
  onPress,
  onSettingsPress,
  isAnyRunning,
  fullWidth = false,
}: IScenarioCardProps) {
  const c = useThemeColors();
  const scale = useSharedValue(1);

  const cardState = getScenarioCardState(
    scenario.id,
    runState,
    activeScenarioId,
    preparedScenarioId,
  );
  const isRunning = cardState === 'running';
  const isActive = cardState === 'active';
  const isPrepared = cardState === 'prepared';
  const isDisabled = isAnyRunning && !isRunning;

  useEffect(() => {
    if (isRunning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(SCENARIO_CARD_PULSE_SCALE, { duration: SCENARIO_CARD_PULSE_MS / 2 }),
          withTiming(1, { duration: SCENARIO_CARD_PULSE_MS / 2 }),
        ),
        -1,
        false,
      );
      return;
    }
    scale.value = withTiming(1, { duration: 200 });
  }, [isRunning, scale]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let highlightKind: 'active' | 'prepared' | 'idle' = 'idle';
  if (isActive) {
    highlightKind = 'active';
  } else if (isPrepared) {
    highlightKind = 'prepared';
  }
  const { backgroundColor, borderColor, iconColor } = getScenarioHighlightColors(c, highlightKind);

  return (
    <Animated.View
      style={[
        styles.card,
        fullWidth ? styles.cardFullWidth : null,
        cardAnimatedStyle,
        { backgroundColor, borderColor, borderWidth: 2 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.scenarios.settingsA11y}
        onPress={() => onSettingsPress(scenario.id)}
        style={styles.settingsButton}
        hitSlop={SCENARIO_CARD_SETTINGS_HIT_SLOP}
      >
        <FontAwesome name="cog" size={16} color={c.textMuted} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={scenarioRunAccessibilityLabel(
          scenario.label,
          isRunning,
          isActive,
          isPrepared,
        )}
        accessibilityState={{ selected: isActive || isPrepared, busy: isRunning }}
        disabled={isDisabled}
        onPress={() => onPress(scenario.id)}
        style={({ pressed }) => [
          styles.runArea,
          { opacity: pressed && !isDisabled ? 0.9 : 1 },
        ]}
      >
        <View style={styles.iconSlot}>
          {isRunning ? (
            <ActivityIndicator color={iconColor} size="small" />
          ) : (
            <FontAwesome
              name={scenario.icon as 'moon-o'}
              size={SCENARIO_CARD_ICON_SIZE}
              color={iconColor}
            />
          )}
        </View>
        <Text style={[typography.subtitle, styles.label, { color: c.text }]}>{scenario.label}</Text>
      </Pressable>
    </Animated.View>
  );
}
