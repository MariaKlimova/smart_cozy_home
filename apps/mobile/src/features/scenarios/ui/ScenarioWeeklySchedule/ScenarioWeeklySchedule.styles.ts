import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  masterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  days: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  dayLabel: {
    width: 32,
    flexShrink: 0,
  },
  dayToggle: {
    width: 51,
    flexShrink: 0,
    alignItems: 'center',
  },
  dayTime: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
});
