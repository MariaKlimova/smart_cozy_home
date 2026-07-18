import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { pct } from '../sleepChartAxis';
import { styles } from '../SleepNightDetail-ScoreMethodSheet.styles';

export function ScaleLabel({
  label,
  ratio,
  align,
}: {
  label: string;
  ratio: number;
  align: 'left' | 'center' | 'right';
}) {
  const c = useThemeColors();

  if (align === 'left') {
    return (
      <Text
        style={[
          typography.caption,
          styles.scaleLabel,
          { color: c.textMuted, left: 0 },
        ]}
      >
        {label}
      </Text>
    );
  }

  if (align === 'right') {
    return (
      <Text
        style={[
          typography.caption,
          styles.scaleLabel,
          { color: c.textMuted, right: 0 },
        ]}
      >
        {label}
      </Text>
    );
  }

  return (
    <Text
      style={[
        typography.caption,
        styles.scaleLabel,
        {
          color: c.textMuted,
          left: pct(ratio),
          transform: [{ translateX: '-50%' }],
        },
      ]}
    >
      {label}
    </Text>
  );
}

export function SheetHeader({
  icon,
  title,
  score,
}: {
  icon: 'moon' | 'clock';
  title: string;
  score: number | null;
}) {
  const c = useThemeColors();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Feather name={icon} size={24} color={c.text} />
        <Text style={[typography.title, styles.headerTitle, { color: c.text }]}>{title}</Text>
      </View>
      {score !== null ? (
        <View style={[styles.scoreBadge, { backgroundColor: c.accentMuted }]}>
          <Text style={[typography.subtitle, { color: c.text }]}>{score}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function StatPair({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  const c = useThemeColors();

  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: c.background }]}>
        <Text style={[typography.caption, { color: c.textMuted }]}>{leftLabel}</Text>
        <Text style={[typography.subtitle, { color: c.text }]}>{leftValue}</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: c.background }]}>
        <Text style={[typography.caption, { color: c.textMuted }]}>{rightLabel}</Text>
        <Text style={[typography.subtitle, { color: c.text }]}>{rightValue}</Text>
      </View>
    </View>
  );
}
