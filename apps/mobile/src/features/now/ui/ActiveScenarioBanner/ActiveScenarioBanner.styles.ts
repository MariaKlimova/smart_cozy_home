import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin, typography } from '@/theme/tokens';

import { ACTIVE_SCENARIO_BANNER_ICON_SIZE } from './ActiveScenarioBanner.const';

export const styles = StyleSheet.create({
  root: {
    borderRadius: radii.sm,
    borderWidth: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchMin,
  },
  iconSlot: {
    width: ACTIVE_SCENARIO_BANNER_ICON_SIZE,
    height: ACTIVE_SCENARIO_BANNER_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.subtitle,
  },
  caption: {
    fontSize: typography.caption.fontSize,
  },
});
