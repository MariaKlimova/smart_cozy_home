import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '@/copy/ru';
import { HaEntityRow } from '@/features/settings/ui/HaEntityRow';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useEntitiesStore } from '@/store/entitiesStore';
import { spacing, typography } from '@/theme/tokens';

export default function HaEntitiesScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  const items = useEntitiesStore((s) => s.items);
  const isLoading = useEntitiesStore((s) => s.isLoading);
  const error = useEntitiesStore((s) => s.error);
  const load = useEntitiesStore((s) => s.load);
  const getSections = useEntitiesStore((s) => s.getSections);

  const [search, setSearch] = useState('');

  const sections = useMemo(() => getSections(search), [getSections, search]);

  const totalShown = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: 'Устройства HA' }} />

      <View style={styles.header}>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.haEntities.hint}
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск: light, sensor, kitchen…"
          placeholderTextColor={c.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.search,
            { color: c.text, borderColor: c.border, backgroundColor: c.surface },
          ]}
        />
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {isLoading ? 'Загрузка…' : `Показано: ${totalShown} из ${items.length}`}
        </Text>
      </View>

      {error && <Text style={[styles.error, { color: c.warning }]}>{error}</Text>}

      {isLoading && items.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={c.accent} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.entityId}
          renderItem={({ item }) => <HaEntityRow item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: c.accentMuted }]}>
              <Text style={[typography.subtitle, { color: c.text }]}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={
            <Text style={[typography.body, styles.empty, { color: c.textMuted }]}>
              {search ? 'Ничего не найдено' : 'Список пуст'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 44,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  error: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  loader: { marginTop: spacing.xl },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
