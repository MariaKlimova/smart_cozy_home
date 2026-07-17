import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: touchMin,
    height: touchMin,
    borderRadius: radii.sm,
  },
  swatchSelected: {
    borderWidth: 2,
  },
  swatchBordered: {
    borderWidth: 1,
  },
});
