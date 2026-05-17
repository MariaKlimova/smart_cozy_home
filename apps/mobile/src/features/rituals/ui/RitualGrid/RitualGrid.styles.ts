import { StyleSheet } from 'react-native';

import { RITUAL_TILE_WIDTH_PERCENT } from './RitualGrid.const';
import { spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: RITUAL_TILE_WIDTH_PERCENT,
    minHeight: touchMin + 24,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    textAlign: 'center',
  },
});
