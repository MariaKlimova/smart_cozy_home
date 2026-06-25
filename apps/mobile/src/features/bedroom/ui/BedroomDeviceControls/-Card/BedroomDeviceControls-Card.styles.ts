import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  configureButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSection: {
    gap: spacing.sm,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
