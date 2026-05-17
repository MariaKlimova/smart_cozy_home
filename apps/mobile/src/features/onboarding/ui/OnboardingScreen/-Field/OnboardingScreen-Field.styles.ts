import { StyleSheet } from 'react-native';

import {
  ONBOARDING_FIELD_FONT_SIZE,
  ONBOARDING_FIELD_MIN_HEIGHT,
} from './OnboardingScreen-Field.const';
import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: ONBOARDING_FIELD_FONT_SIZE,
    minHeight: ONBOARDING_FIELD_MIN_HEIGHT,
  },
});
