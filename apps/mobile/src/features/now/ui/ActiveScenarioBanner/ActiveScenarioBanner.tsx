import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';

import {
  ACTIVE_SCENARIO_BANNER,
  ACTIVE_SCENARIO_BANNER_ICON_SIZE,
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

  const borderColor = isActive ? c.accent : c.success;
  const iconColor = isActive ? c.accent : c.success;
  const backgroundColor = isActive ? c.accentMuted : c.surface;
  const caption = isActive ? copy.scenarios.activeNow : copy.scenarios.prepared;

  let accessibilityLabel = `${scenario.label}. ${caption}`;
  if (isActive) {
    accessibilityLabel = copy.now.activeScenarioExitA11y.replace('{label}', scenario.label);
  }

  return (
    <Pressable
      testID={ACTIVE_SCENARIO_BANNER}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: true, busy: isRunning }}
      disabled={isRunning}
      onPress={() => onPress(scenario.id)}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor, borderColor, opacity: pressed && !isRunning ? 0.9 : 1 },
      ]}
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
        <Text style={[styles.title, { color: c.text }]}>
          {copy.now.activeScenarioTitle.replace('{label}', scenario.label)}
        </Text>
        <Text style={[styles.caption, { color: iconColor }]}>{caption}</Text>
      </View>
    </Pressable>
  );
}
