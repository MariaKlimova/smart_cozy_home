import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin, typography } from '@/theme/tokens';

import {
  ACTIVE_SCENARIO_BANNER_ICON_SIZE,
  ACTIVE_SCENARIO_BANNER_POWER_SIZE,
} from './ActiveScenarioBanner.const';

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
    gap: spacing.xxs,
  },
  title: {
    ...typography.subtitle,
  },
  caption: {
    ...typography.caption,
  },
  powerSlot: {
    width: ACTIVE_SCENARIO_BANNER_POWER_SIZE,
    height: ACTIVE_SCENARIO_BANNER_POWER_SIZE,
    borderRadius: ACTIVE_SCENARIO_BANNER_POWER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
