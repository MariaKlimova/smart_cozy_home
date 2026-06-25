import { Text, View, useWindowDimensions } from 'react-native';

import { BedroomStateCardMetrics } from './-Metrics';
import { BedroomStateCardSkeleton } from './-Skeleton';
import { toneAccentColor, toneSurfaceColor, toneWatermark } from './bedroomStateTone';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IBedroomStateCardProps } from './BedroomStateCard.typings';
import { cardMinHeight, styles } from './BedroomStateCard.styles';

export function BedroomStateCard({ phrase, metrics, tone, isLoading }: IBedroomStateCardProps) {
  const c = useThemeColors();
  const { height } = useWindowDimensions();
  const minHeight = cardMinHeight(height);
  const accent = toneAccentColor(tone, c);
  const surface = toneSurfaceColor(tone, c);
  const watermark = toneWatermark(tone);

  return (
    <View
      style={[styles.shell, { minHeight, backgroundColor: surface, borderColor: c.border }]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.inner}>
        {isLoading ? (
          <BedroomStateCardSkeleton />
        ) : (
          <>
            <View style={styles.phraseRow}>
              <Text style={[typography.title, styles.phrase, { color: c.text }]}>{phrase}</Text>
              <Text style={styles.watermark} accessibilityElementsHidden importantForAccessibility="no">
                {watermark}
              </Text>
            </View>
            <BedroomStateCardMetrics metrics={metrics} />
          </>
        )}
      </View>
    </View>
  );
}
