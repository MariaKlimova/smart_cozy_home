import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  friendlyName: {
    marginTop: 0,
  },
  entityId: {
    marginTop: 2,
  },
  state: {
    marginTop: 4,
  },
});
