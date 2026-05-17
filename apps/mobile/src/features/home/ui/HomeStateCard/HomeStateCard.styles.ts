import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
