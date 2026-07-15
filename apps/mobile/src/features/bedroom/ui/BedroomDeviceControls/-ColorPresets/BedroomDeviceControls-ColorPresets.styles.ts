import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
  },
  swatchSelected: {
    borderWidth: 2,
  },
  swatchBordered: {
    borderWidth: 1,
  },
});
