import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

import { BEDROOM_CARD_HEIGHT_RATIO } from './BedroomStateCard.const';

export const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  inner: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 6,
    gap: spacing.lg,
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  phrase: {
    flex: 1,
    lineHeight: 34,
  },
  watermark: {
    fontSize: 40,
    lineHeight: 44,
    opacity: 0.7,
    marginTop: -4,
  },
});

export function cardMinHeight(screenHeight: number): number {
  return Math.round(screenHeight * BEDROOM_CARD_HEIGHT_RATIO);
}
