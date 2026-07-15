import { Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { typography } from '@/theme/tokens';

import type { IBedroomSensorControlsCardProps } from './BedroomSensorControls-Card.typings';
import { styles } from './BedroomSensorControls-Card.styles';

/** Число и единица для слотов с отдельным unit (как на карточке «Сейчас») */
function splitMetricUnit(
  slot: IBedroomSensorControlsCardProps['slot'],
  valueLabel: string,
): { number: string; unit: string } | null {
  let unit: string | undefined;
  if (slot === 'co2') {
    unit = copy.now.metrics.ppmUnit;
  } else if (slot === 'pressure') {
    unit = copy.now.metrics.mmhgUnit;
  }
  if (!unit) return null;

  const suffix = ` ${unit}`;
  if (!valueLabel.endsWith(suffix)) return null;

  return {
    number: valueLabel.slice(0, -suffix.length),
    unit,
  };
}

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
  const metricWithUnit = splitMetricUnit(slot, valueLabel);

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
        {metricWithUnit ? (
          <View style={styles.valueRow}>
            <Text style={[typography.title, { color: valueColor }]}>{metricWithUnit.number}</Text>
            <Text style={[typography.caption, styles.unit, { color: c.textMuted }]}>
              {metricWithUnit.unit}
            </Text>
          </View>
        ) : (
          <Text style={[typography.title, { color: valueColor }]}>{valueLabel}</Text>
        )}
      </View>
    </CalmCard>
  );
}
