import { StyleSheet } from 'react-native';

import { radii, spacing, touchMin } from '@/theme/tokens';

import {
  SCENARIO_CARD_ICON_SIZE,
  SCENARIO_CARD_SETTINGS_INSET,
} from './ScenarioCard.const';

export const SCENARIO_CARD_TILE_WIDTH_PERCENT = '47%' as const;

export const styles = StyleSheet.create({
  card: {
    width: SCENARIO_CARD_TILE_WIDTH_PERCENT,
    minHeight: touchMin + 32,
    borderRadius: radii.sm,
    borderWidth: 2,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  cardFullWidth: {
    width: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: touchMin,
    height: touchMin,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: SCENARIO_CARD_SETTINGS_INSET,
    paddingRight: SCENARIO_CARD_SETTINGS_INSET,
  },
  runArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  iconSlot: {
    width: SCENARIO_CARD_ICON_SIZE,
    height: SCENARIO_CARD_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
