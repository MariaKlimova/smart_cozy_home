import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
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

import type { IHaEntitiesScreenProps } from './HaEntitiesScreen.typings';
import { styles } from './HaEntitiesScreen.styles';

function formatShownCount(shown: number, total: number): string {
  return copy.haEntities.shownCount
    .replace('{shown}', String(shown))
    .replace('{total}', String(total));
}

export function HaEntitiesScreen(_props: IHaEntitiesScreenProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  const items = useEntitiesStore((s) => s.items);
  const isLoading = useEntitiesStore((s) => s.isLoading);
  const error = useEntitiesStore((s) => s.error);
  const load = useEntitiesStore((s) => s.load);
  const getSections = useEntitiesStore((s) => s.getSections);

  const [search, setSearch] = useState('');

  const sections = getSections(search);

  const totalShown = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const emptyLabel = search ? copy.haEntities.emptySearch : copy.haEntities.emptyList;
  const statusLabel = isLoading
    ? copy.haEntities.loading
    : formatShownCount(totalShown, items.length);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: c.textMuted }]}>{copy.haEntities.hint}</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={copy.haEntities.searchPlaceholder}
          placeholderTextColor={c.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.search,
            { color: c.text, borderColor: c.border, backgroundColor: c.surface },
          ]}
        />
        <Text style={[typography.caption, { color: c.textMuted }]}>{statusLabel}</Text>
      </View>

      {error ? <Text style={[styles.error, { color: c.warning }]}>{error}</Text> : null}

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
              {emptyLabel}
            </Text>
          }
        />
      )}
    </View>
  );
}
