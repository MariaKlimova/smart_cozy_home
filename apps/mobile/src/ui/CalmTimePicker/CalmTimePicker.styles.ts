import { StyleSheet } from 'react-native';

import { spacing, touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  button: {
    minHeight: touchMin,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    fontWeight: '600',
  },
});
