import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '@/copy/ru';
import { formatScenarioCardSubtitle } from '@/features/scenarios/lib/formatScenarioCardSubtitle';
import { getScenarioCardState } from '@/features/scenarios/lib/getScenarioCardState';
import { useScheduleClockTick } from '@/features/scenarios/lib/useScheduleClockTick';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import {
  SCENARIO_CARD_PULSE_MS,
  SCENARIO_CARD_PULSE_SCALE,
  SCENARIO_CARD_SETTINGS_HIT_SLOP,
} from './ScenarioCard.const';
import type { IScenarioCardProps } from './ScenarioCard.typings';
import { styles } from './ScenarioCard.styles';

export function ScenarioCard({
  scenario,
  runState,
  activeScenarioId,
  preparedScenarioId,
  onPress,
  onSettingsPress,
  isAnyRunning,
}: IScenarioCardProps) {
  const c = useThemeColors();
  const scheduleNow = useScheduleClockTick();
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
  const subtitle = formatScenarioCardSubtitle(scenario, cardState, scheduleNow);

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

  let backgroundColor: string = c.surface;
  let borderColor: string = c.border;
  let iconColor: string = c.accent;
  let subtitleColor: string = c.textMuted;

  if (isActive) {
    backgroundColor = c.accentMuted;
    borderColor = c.accent;
    subtitleColor = c.accent;
  } else if (isPrepared) {
    backgroundColor = c.surface;
    borderColor = c.success;
    iconColor = c.success;
    subtitleColor = c.success;
  }

  return (
    <Animated.View
      style={[
        styles.card,
        cardAnimatedStyle,
        { backgroundColor, borderColor, borderWidth: isActive || isPrepared ? 2 : 1 },
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
        accessibilityLabel={scenario.label}
        disabled={isDisabled}
        onPress={() => onPress(scenario.id)}
        style={({ pressed }) => [
          styles.runArea,
          { opacity: pressed && !isDisabled ? 0.9 : 1 },
        ]}
      >
        {isRunning ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <FontAwesome name={scenario.icon as 'moon-o'} size={24} color={iconColor} />
        )}
        <Text style={[typography.subtitle, styles.label, { color: c.text }]}>{scenario.label}</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
}
