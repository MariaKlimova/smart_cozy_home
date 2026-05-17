import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: { flex: 1 },
});
