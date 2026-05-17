import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.md,
  },
  actions: { gap: spacing.sm },
  btn: { alignSelf: 'stretch' },
});
