import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  withTopMargin: {
    marginTop: spacing.md,
  },
  normRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  normTrack: {
    flex: 1,
    height: 10,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  normFill: {
    height: '100%',
    borderRadius: radii.sm,
  },
  normLabel: {
    flexShrink: 0,
  },
});
