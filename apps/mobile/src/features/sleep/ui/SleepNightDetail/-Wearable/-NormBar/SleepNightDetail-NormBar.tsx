import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { ISleepNightDetailNormBarProps } from './SleepNightDetail-NormBar.typings';
import { styles } from './SleepNightDetail-NormBar.styles';

export function SleepNightDetailNormBar({ progress, withTopMargin }: ISleepNightDetailNormBarProps) {
  const c = useThemeColors();
  const progressPct = Math.round(progress * 100);

  return (
    <View style={withTopMargin ? styles.withTopMargin : undefined}>
      <View style={styles.normRow}>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: progressPct,
          }}
          style={[styles.normTrack, { backgroundColor: c.border }]}
        >
          <View
            style={[
              styles.normFill,
              {
                width: `${progressPct}%`,
                backgroundColor: c.warning,
              },
            ]}
          />
        </View>
        <Text style={[typography.caption, styles.normLabel, { color: c.textMuted }]}>
          {copy.sleep.wearableSleepNorm}
        </Text>
      </View>
    </View>
  );
}
