import { router } from 'expo-router';
import { forwardRef, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollView,
  type TextInput as TextInputType,
} from 'react-native';

import { copy } from '@/copy/ru';
import type { IConnectionProfile } from '@/ha/types';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { spacing, typography } from '@/theme/tokens';

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

export default function OnboardingScreen() {
  const c = useThemeColors();
  const connect = useConnectionStore((s) => s.connect);
  const error = useConnectionStore((s) => s.error);

  const scrollRef = useRef<ScrollView>(null);
  const tokenInputRef = useRef<TextInputType>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('Дом');
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
      id: 'default',
      name: name.trim() || 'Дом',
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
        Только удалённый URL? Оставь локальный пустым — подключимся сразу к Nabu Casa.
      </Text>

      <Field label={copy.onboarding.name} value={name} onChangeText={setName} onFocus={scrollFieldIntoView} />

      <Field
        ref={tokenInputRef}
        label={copy.onboarding.token}
        value={token}
        onChangeText={setToken}
        secure
        onFocus={scrollFieldIntoView}
        textContentType="password"
        autoComplete="off"
      />

      <Field
        label={copy.onboarding.remoteUrl}
        value={remoteUrl}
        onChangeText={setRemoteUrl}
        placeholder="https://….ui.nabu.casa"
        onFocus={scrollFieldIntoView}
        keyboardType="url"
        autoCapitalize="none"
      />

      <Field
        label={copy.onboarding.localUrl}
        value={localUrl}
        onChangeText={setLocalUrl}
        placeholder="http://192.168.x.x:8123 (опционально)"
        onFocus={scrollFieldIntoView}
        keyboardType="url"
        autoCapitalize="none"
      />

      {error && <Text style={{ color: c.warning }}>{error}</Text>}

      <CalmButton
        label={copy.onboarding.save}
        onPress={handleSave}
        isLoading={isSaving}
        disabled={!token.trim() || (!localUrl.trim() && !remoteUrl.trim())}
      />
    </ScreenLayout>
  );
}

const Field = forwardRef<TextInputType, {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  placeholder?: string;
  onFocus?: () => void;
  keyboardType?: 'default' | 'url';
  autoCapitalize?: 'none' | 'sentences';
  textContentType?: 'password' | 'none';
  autoComplete?: 'off' | 'password';
}>(function Field(
  {
    label,
    value,
    onChangeText,
    secure,
    placeholder,
    onFocus,
    keyboardType = 'default',
    autoCapitalize = 'none',
    textContentType,
    autoComplete,
  },
  ref,
) {
  const c = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholder={placeholder}
        onFocus={onFocus}
        keyboardType={keyboardType}
        textContentType={textContentType}
        autoComplete={autoComplete}
        style={[
          styles.input,
          {
            color: c.text,
            borderColor: c.border,
            backgroundColor: c.surface,
          },
        ]}
        placeholderTextColor={c.textMuted}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 48,
  },
});
