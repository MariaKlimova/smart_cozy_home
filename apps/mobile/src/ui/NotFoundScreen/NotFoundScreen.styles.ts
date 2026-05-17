import { StyleSheet } from 'react-native';

import { spacing, touchMin, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.subtitle,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    minHeight: touchMin,
    justifyContent: 'center',
  },
  linkText: {
    ...typography.body,
  },
});
