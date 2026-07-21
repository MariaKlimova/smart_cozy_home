import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { copy } from '@/copy/ru';
import type { IConnectionProfile } from '@/domain/connection.typings';
import { connectionFailureMessageKey } from '@/domain/connectionStatus';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

import { OnboardingScreenField } from './-Field';
import {
  ONBOARDING_DEFAULT_HOME_NAME,
  ONBOARDING_DEFAULT_PROFILE_ID,
} from './OnboardingScreen.const';
import type { IOnboardingScreenProps } from './OnboardingScreen.typings';

function resolvePreferred(
  local?: string,
  remote?: string,
): IConnectionProfile['preferred'] {
  const hasLocal = Boolean(local?.trim());
  const hasRemote = Boolean(remote?.trim());
  if (hasRemote && !hasLocal) return 'remote';
  if (hasLocal && !hasRemote) return 'local';
  return 'auto';
}

export function OnboardingScreen({ isEditing = false }: IOnboardingScreenProps) {
  const c = useThemeColors();
  const connect = useConnectionStore((s) => s.connect);
  const failureReason = useConnectionStore((s) => s.failureReason);
  const isLoading = useConnectionStore((s) => s.isLoading);
  const existingProfile = useConnectionStore((s) => s.profile);

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(
    () => existingProfile?.name ?? ONBOARDING_DEFAULT_HOME_NAME,
  );
  const [localUrl, setLocalUrl] = useState(() => existingProfile?.localUrl ?? '');
  const [remoteUrl, setRemoteUrl] = useState(() => existingProfile?.remoteUrl ?? '');
  const [token, setToken] = useState(() => existingProfile?.accessToken ?? '');

  const connectErrorKey = failureReason ? connectionFailureMessageKey(failureReason) : null;
  const connectError = connectErrorKey ? copy.connection[connectErrorKey] : null;

  async function handleSave() {
    const trimmedLocal = localUrl.trim();
    const trimmedRemote = remoteUrl.trim();

    if (!trimmedLocal && !trimmedRemote) {
      return;
    }

    const profile: IConnectionProfile = {
      id: existingProfile?.id ?? ONBOARDING_DEFAULT_PROFILE_ID,
      name: name.trim() || ONBOARDING_DEFAULT_HOME_NAME,
      localUrl: trimmedLocal || undefined,
      remoteUrl: trimmedRemote || undefined,
      accessToken: token.trim(),
      preferred: resolvePreferred(trimmedLocal, trimmedRemote),
    };

    setIsSaving(true);
    try {
      await connect(profile);
      const { isConnected } = useConnectionStore.getState();
      if (!isConnected) {
        return;
      }
      if (isEditing && router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenLayout
      title={isEditing ? undefined : copy.onboarding.title}
      variant={isEditing ? 'stack' : 'tab'}
      keyboardAware
      showConnectionBanner={false}
    >
      <Text style={[typography.body, { color: c.textMuted }]}>{copy.onboarding.subtitle}</Text>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        {copy.onboarding.remoteOnlyHint}
      </Text>

      <OnboardingScreenField
        label={copy.onboarding.name}
        value={name}
        onChangeText={setName}
      />

      <OnboardingScreenField
        label={copy.onboarding.token}
        value={token}
        onChangeText={setToken}
        secure
        textContentType="password"
        autoComplete="off"
      />

      <OnboardingScreenField
        label={copy.onboarding.remoteUrl}
        value={remoteUrl}
        onChangeText={setRemoteUrl}
        placeholder={copy.onboarding.remoteUrlPlaceholder}
        keyboardType="url"
        autoCapitalize="none"
      />

      <OnboardingScreenField
        label={copy.onboarding.localUrl}
        value={localUrl}
        onChangeText={setLocalUrl}
        placeholder={copy.onboarding.localUrlPlaceholder}
        keyboardType="url"
        autoCapitalize="none"
      />

      {connectError ? <Text style={{ color: c.warning }}>{connectError}</Text> : null}

      <CalmButton
        label={copy.onboarding.save}
        onPress={handleSave}
        isLoading={isSaving || isLoading}
        disabled={!token.trim() || (!localUrl.trim() && !remoteUrl.trim())}
      />
    </ScreenLayout>
  );
}
