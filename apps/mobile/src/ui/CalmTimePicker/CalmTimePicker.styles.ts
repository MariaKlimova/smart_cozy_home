import { StyleSheet } from 'react-native';

import { overlay, radii, spacing, touchMin } from '@/theme/tokens';

import { CALM_TIME_PICKER_MIN_WIDTH } from './CalmTimePicker.const';

export const styles = StyleSheet.create({
  button: {
    minHeight: touchMin,
    minWidth: CALM_TIME_PICKER_MIN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: overlay.scrim,
  },
  modalSheet: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iosPickerWrap: {
    alignItems: 'center',
  },
  doneButton: {
    minHeight: touchMin,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
