import { Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { typography } from '@/theme/tokens';

import type { IBedroomSensorControlsCardProps } from './BedroomSensorControls-Card.typings';
import { styles } from './BedroomSensorControls-Card.styles';

export function BedroomSensorControlsCard({
  slot,
  label,
  valueLabel,
  uiState,
  onConfigure,
}: IBedroomSensorControlsCardProps) {
  const c = useThemeColors();
  const isMuted =
    uiState === 'disabled' ||
    valueLabel === copy.bedroom.sensors.notConfigured ||
    valueLabel === copy.bedroom.sensors.notUsed ||
    valueLabel === copy.bedroom.unavailable;
  const valueColor = isMuted ? c.textMuted : c.accent;
  const isCo2Value = slot === 'co2' && valueLabel.endsWith(' ppm');
  const co2Number = isCo2Value ? valueLabel.slice(0, -4) : null;

  return (
    <CalmCard padding="md" style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.subtitle, styles.title, { color: c.text }]}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}. ${copy.bedroom.sensors.configureA11y}`}
          onPress={onConfigure}
          style={styles.configureButton}
          hitSlop={8}
        >
          <FontAwesome name="cog" size={18} color={c.textMuted} />
        </Pressable>
      </View>
      <View style={styles.valueSection}>
        {isCo2Value && co2Number ? (
          <View style={styles.valueRow}>
            <Text style={[typography.title, { color: valueColor }]}>{co2Number}</Text>
            <Text style={[typography.caption, styles.unit, { color: c.textMuted }]}>ppm</Text>
          </View>
        ) : (
          <Text style={[typography.title, { color: valueColor }]}>{valueLabel}</Text>
        )}
      </View>
    </CalmCard>
  );
}
