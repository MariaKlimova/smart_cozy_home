import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { IRitualGridProps } from './RitualGrid.typings';
import { styles } from './RitualGrid.styles';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

export function RitualGrid({ rituals, runningId, onRitualPress }: IRitualGridProps) {
  const c = useThemeColors();

  return (
    <View style={styles.grid}>
      {rituals.map((ritual) => {
        const isRunning = runningId === ritual.id;
        return (
          <Pressable
            key={ritual.id}
            accessibilityRole="button"
            accessibilityLabel={ritual.label}
            onPress={() => onRitualPress(ritual.id)}
            disabled={!!runningId}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {isRunning ? (
              <ActivityIndicator color={c.accent} />
            ) : (
              <FontAwesome name={ritual.icon as 'moon-o'} size={24} color={c.accent} />
            )}
            <Text style={[typography.subtitle, styles.label, { color: c.text }]}>
              {ritual.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
