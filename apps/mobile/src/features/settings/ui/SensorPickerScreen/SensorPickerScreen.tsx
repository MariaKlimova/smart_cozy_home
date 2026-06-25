import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
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
import { filterSensorsForSlot } from '@/features/settings/lib/sensorPickerFilters';
import { SensorPickerRow } from '@/features/settings/ui/SensorPickerRow';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useEntitiesStore } from '@/store/entitiesStore';
import { spacing, typography } from '@/theme/tokens';

import type { ISensorPickerScreenProps } from './SensorPickerScreen.typings';
import { styles } from './SensorPickerScreen.styles';

export function SensorPickerScreen({ slot }: ISensorPickerScreenProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const setSlot = useBedroomSensorStore((s) => s.setSlot);

  const items = useEntitiesStore((s) => s.items);
  const isLoading = useEntitiesStore((s) => s.isLoading);
  const error = useEntitiesStore((s) => s.error);
  const load = useEntitiesStore((s) => s.load);

  const [search, setSearch] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  const { recommended, other } = useMemo(
    () => filterSensorsForSlot(items, slot, search),
    [items, slot, search],
  );

  const sections = useMemo(() => {
    const result: { title: string; data: typeof recommended }[] = [];
    if (recommended.length > 0) {
      result.push({ title: copy.sensorPicker.recommended, data: recommended });
    }
    if (other.length > 0) {
      result.push({ title: copy.sensorPicker.other, data: other });
    }
    return result;
  }, [recommended, other]);

  const totalShown = recommended.length + other.length;
  const emptyLabel = search ? copy.sensorPicker.emptySearch : copy.sensorPicker.emptyList;

  async function handleSelect(entityId: string) {
    await setSlot(slot, entityId);
    await queryClient.invalidateQueries({ queryKey: ['bedroom-sensors'] });
    await queryClient.invalidateQueries({ queryKey: ['bedroom-sensor-preview'] });
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={copy.sensorPicker.searchPlaceholder}
          placeholderTextColor={c.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.search,
            { color: c.text, borderColor: c.border, backgroundColor: c.surface },
          ]}
        />
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {isLoading
            ? copy.sensorPicker.loading
            : copy.sensorPicker.shownCount.replace('{shown}', String(totalShown))}
        </Text>
      </View>

      {error ? (
        <Text style={[typography.caption, { color: c.warning, paddingHorizontal: spacing.md }]}>
          {error}
        </Text>
      ) : null}

      {isLoading && items.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={c.accent} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.entityId}
          renderItem={({ item }) => (
            <SensorPickerRow
              slot={slot}
              item={item}
              onPress={() => void handleSelect(item.entityId)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: c.accentMuted }]}>
              <Text style={[typography.subtitle, { color: c.text }]}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xl,
          }}
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
