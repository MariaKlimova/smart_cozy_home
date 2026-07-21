import { Stack, useLocalSearchParams } from 'expo-router';

import { copy } from '@/copy/ru';
import {
  ONBOARDING_EDIT_PARAM,
  ONBOARDING_EDIT_VALUE,
  OnboardingScreen,
} from '@/features/onboarding/ui/OnboardingScreen';

export default function OnboardingRoute() {
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEditing = params[ONBOARDING_EDIT_PARAM] === ONBOARDING_EDIT_VALUE;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: isEditing,
          title: copy.onboarding.title,
          headerBackTitle: copy.settings.screenTitle,
        }}
      />
      <OnboardingScreen isEditing={isEditing} />
    </>
  );
}
