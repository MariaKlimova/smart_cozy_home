import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
  },
  row: { marginTop: spacing.xs },
  error: { marginTop: spacing.sm },
  missing: { marginTop: spacing.sm, gap: 2 },
  preview: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
  },
  previewCaption: {
    marginBottom: spacing.xs,
  },
  button: { marginTop: spacing.md },
  mono: {
    fontFamily: 'monospace',
  },
});
