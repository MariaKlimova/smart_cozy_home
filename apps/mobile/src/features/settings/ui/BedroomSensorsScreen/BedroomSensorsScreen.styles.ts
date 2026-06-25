import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  slotSpacing: {
    marginBottom: spacing.lg,
  },
  hint: {
    marginBottom: spacing.md,
  },
});
