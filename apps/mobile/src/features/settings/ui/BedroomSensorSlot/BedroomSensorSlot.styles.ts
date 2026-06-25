import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  deviceName: {
    marginTop: spacing.xs,
  },
  preview: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexGrow: 1,
    minWidth: 120,
  },
});
