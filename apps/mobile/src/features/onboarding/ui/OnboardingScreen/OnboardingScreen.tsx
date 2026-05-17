import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, type ScrollView, type TextInput } from 'react-native';

import { copy } from '@/copy/ru';
import type { IConnectionProfile } from '@/ha/types';
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

export function OnboardingScreen(_props: IOnboardingScreenProps) {
  const c = useThemeColors();
  const connect = useConnectionStore((s) => s.connect);
  const error = useConnectionStore((s) => s.error);

  const scrollRef = useRef<ScrollView>(null);
  const tokenInputRef = useRef<TextInput>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState<string>(ONBOARDING_DEFAULT_HOME_NAME);
  const [localUrl, setLocalUrl] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [token, setToken] = useState('');

  function scrollFieldIntoView() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  async function handleSave() {
    const trimmedLocal = localUrl.trim();
    const trimmedRemote = remoteUrl.trim();

    if (!trimmedLocal && !trimmedRemote) {
      return;
    }

    const profile: IConnectionProfile = {
      id: ONBOARDING_DEFAULT_PROFILE_ID,
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
      if (isConnected) {
        router.replace('/(tabs)');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenLayout ref={scrollRef} title={copy.onboarding.title} keyboardAware>
      <Text style={[typography.body, { color: c.textMuted }]}>{copy.onboarding.subtitle}</Text>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        {copy.onboarding.remoteOnlyHint}
      </Text>

      <OnboardingScreenField
        label={copy.onboarding.name}
        value={name}
        onChangeText={setName}
        onFocus={scrollFieldIntoView}
      />

      <OnboardingScreenField
        inputRef={tokenInputRef}
        label={copy.onboarding.token}
        value={token}
        onChangeText={setToken}
        secure
        onFocus={scrollFieldIntoView}
        textContentType="password"
        autoComplete="off"
      />

      <OnboardingScreenField
        label={copy.onboarding.remoteUrl}
        value={remoteUrl}
        onChangeText={setRemoteUrl}
        placeholder={copy.onboarding.remoteUrlPlaceholder}
        onFocus={scrollFieldIntoView}
        keyboardType="url"
        autoCapitalize="none"
      />

      <OnboardingScreenField
        label={copy.onboarding.localUrl}
        value={localUrl}
        onChangeText={setLocalUrl}
        placeholder={copy.onboarding.localUrlPlaceholder}
        onFocus={scrollFieldIntoView}
        keyboardType="url"
        autoCapitalize="none"
      />

      {error ? <Text style={{ color: c.warning }}>{error}</Text> : null}

      <CalmButton
        label={copy.onboarding.save}
        onPress={handleSave}
        isLoading={isSaving}
        disabled={!token.trim() || (!localUrl.trim() && !remoteUrl.trim())}
      />
    </ScreenLayout>
  );
}
