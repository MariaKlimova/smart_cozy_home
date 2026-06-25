import { useQueryClient } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOME_CONFIG } from '@/config/homeConfig';
import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';
import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { CalmCard } from '@/ui/CalmCard';
import { CalmToggle } from '@/ui/CalmToggle';
import { typography, spacing } from '@/theme/tokens';

import { BEDROOM_DEVICE_SLOTS } from './BedroomDevicesScreen.const';
import type { IBedroomDevicesScreenProps } from './BedroomDevicesScreen.typings';
import { styles } from './BedroomDevicesScreen.styles';

const SLOT_LABELS = new Map(
  HOME_CONFIG.bedroom_devices.devices.map((device) => [device.id, device.label]),
);

const EMPTY_HIDDEN_SLOTS: TBedroomDeviceSlot[] = [];

export function BedroomDevicesScreen(_props: IBedroomDevicesScreenProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const hiddenSlots = useBedroomDeviceStore((s) => s.config?.hiddenSlots ?? EMPTY_HIDDEN_SLOTS);
  const setSlotVisible = useBedroomDeviceStore((s) => s.setSlotVisible);
  const hiddenSet = new Set(hiddenSlots);

  async function handleToggle(slot: TBedroomDeviceSlot, visible: boolean) {
    await setSlotVisible(slot, visible);
    await queryClient.invalidateQueries({ queryKey: ['bedroom-devices'] });
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
    >
      <Text style={[typography.caption, styles.hint, { color: c.textMuted }]}>
        {copy.settings.bedroomDevices.hint}
      </Text>

      {BEDROOM_DEVICE_SLOTS.map((slot, index) => {
        const isLast = index === BEDROOM_DEVICE_SLOTS.length - 1;
        const label = SLOT_LABELS.get(slot) ?? slot;
        const visible = !hiddenSet.has(slot);

        return (
          <View key={slot} style={isLast ? undefined : styles.slotSpacing}>
            <CalmCard padding="md" style={styles.row}>
              <Text style={[typography.subtitle, styles.label, { color: c.text }]}>{label}</Text>
              <CalmToggle
                value={visible}
                onValueChange={(next) => void handleToggle(slot, next)}
                accessibilityLabel={`${label}. ${copy.settings.bedroomDevices.showInListA11y}`}
              />
            </CalmCard>
          </View>
        );
      })}
    </ScrollView>
  );
}
