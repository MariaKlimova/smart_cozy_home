import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { getActiveBedroomDeviceEntityIds, resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import { copy } from '@/copy/ru';
import { useBedroomControls } from '@/features/bedroom/lib/useBedroomControls';
import { BedroomDeviceControls } from '@/features/bedroom/ui/BedroomDeviceControls';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useConnectionStore } from '@/store/connectionStore';
import { CalmSheet } from '@/ui/CalmSheet';
import { typography } from '@/theme/tokens';

import { ADJUST_SHEET } from './AdjustSheet.const';
import type { IAdjustSheetProps } from './AdjustSheet.typings';
import { styles } from './AdjustSheet.styles';

export function AdjustSheet({ visible, onClose, onManualControlError }: IAdjustSheetProps) {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const deviceConfig = useBedroomDeviceStore((s) => s.config);
  const hasActiveDevices =
    getActiveBedroomDeviceEntityIds(resolveBedroomDevices(deviceConfig)).length > 0;

  const {
    devices,
    isLoading,
    isError,
    pendingDeviceId,
    setSlider,
    setToggle,
    setSegment,
  } = useBedroomControls({ enabled: visible });

  const handleSliderComplete = useCallback(
    async (deviceId: string, value: number) => {
      const applied = await setSlider(deviceId, value);
      if (!applied) {
        onManualControlError();
      }
      return applied;
    },
    [setSlider, onManualControlError],
  );

  const handleToggle = useCallback(
    async (deviceId: string, isOn: boolean) => {
      const applied = await setToggle(deviceId, isOn);
      if (!applied) {
        onManualControlError();
      }
    },
    [setToggle, onManualControlError],
  );

  const handleSegmentSelect = useCallback(
    async (deviceId: string, optionId: string) => {
      const applied = await setSegment(deviceId, optionId);
      if (!applied) {
        onManualControlError();
      }
    },
    [setSegment, onManualControlError],
  );

  return (
    <CalmSheet
      visible={visible}
      title={copy.quickActions.manualControl}
      subtitle={copy.quickActions.manualControlRoom}
      onClose={onClose}
    >
      <View style={styles.panel} testID={ADJUST_SHEET}>
        {!isConnected ? (
          <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.offline}</Text>
        ) : null}

        {isConnected && isLoading ? (
          <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.checking}</Text>
        ) : null}

        {isConnected && isError && hasActiveDevices ? (
          <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.offline}</Text>
        ) : null}

        {isConnected && !hasActiveDevices ? (
          <Text style={[typography.body, { color: c.textMuted }]}>
            {copy.bedroom.emptyDevicesHint}
          </Text>
        ) : null}

        {isConnected && hasActiveDevices && devices ? (
          <BedroomDeviceControls
            devices={devices}
            pendingDeviceId={pendingDeviceId}
            showConfigure={false}
            onSliderComplete={handleSliderComplete}
            onToggle={(deviceId, isOn) => void handleToggle(deviceId, isOn)}
            onSegmentSelect={(deviceId, optionId) => void handleSegmentSelect(deviceId, optionId)}
          />
        ) : null}
      </View>
    </CalmSheet>
  );
}
