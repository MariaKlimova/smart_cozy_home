import { StyleSheet } from 'react-native';

import { spacing, radii, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: touchMin,
  },
  label: {
    flex: 1,
  },
});
