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
import { filterDevicesForSlot } from '@/features/settings/lib/devicePickerFilters';
import { DevicePickerRow } from '@/features/settings/ui/DevicePickerRow';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useEntitiesStore } from '@/store/entitiesStore';
import { spacing, typography } from '@/theme/tokens';

import type { IDevicePickerScreenProps } from './DevicePickerScreen.typings';
import { styles } from './DevicePickerScreen.styles';

export function DevicePickerScreen({ slot }: IDevicePickerScreenProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const setSlotEntity = useBedroomDeviceStore((s) => s.setSlotEntity);

  const items = useEntitiesStore((s) => s.items);
  const isLoading = useEntitiesStore((s) => s.isLoading);
  const error = useEntitiesStore((s) => s.error);
  const load = useEntitiesStore((s) => s.load);

  const [search, setSearch] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  const { recommended, other } = useMemo(
    () => filterDevicesForSlot(items, slot, search),
    [items, slot, search],
  );

  const sections = useMemo(() => {
    const result: { title: string; data: typeof recommended }[] = [];
    if (recommended.length > 0) {
      result.push({ title: copy.devicePicker.recommended, data: recommended });
    }
    if (other.length > 0) {
      result.push({ title: copy.devicePicker.other, data: other });
    }
    return result;
  }, [recommended, other]);

  const totalShown = recommended.length + other.length;
  const emptyLabel = search ? copy.devicePicker.emptySearch : copy.devicePicker.emptyList;

  async function handleSelect(entityId: string) {
    await setSlotEntity(slot, entityId);
    await queryClient.invalidateQueries({ queryKey: ['bedroom-devices'] });
    await queryClient.invalidateQueries({ queryKey: ['bedroom-device-preview'] });
    router.back();
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={copy.devicePicker.searchPlaceholder}
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
            ? copy.devicePicker.loading
            : copy.devicePicker.shownCount.replace('{shown}', String(totalShown))}
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
            <DevicePickerRow item={item} onPress={() => void handleSelect(item.entityId)} />
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
