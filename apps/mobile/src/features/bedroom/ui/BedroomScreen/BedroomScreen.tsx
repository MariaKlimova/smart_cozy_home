import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';
import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { getActiveBedroomDeviceEntityIds } from '@/config/resolveBedroomDevices';
import { copy } from '@/copy/ru';
import { useBedroomControls } from '@/features/bedroom/lib/useBedroomControls';
import { BedroomDeviceControls } from '@/features/bedroom/ui/BedroomDeviceControls';
import { BedroomSensorControls } from '@/features/bedroom/ui/BedroomSensorControls';
import { useBedroom } from '@/features/now/lib/useBedroom';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useHaBackend } from '@/hooks/useHaBackend';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { CalmButton } from '@/ui/CalmButton';
import { CalmSegmented } from '@/ui/CalmSegmented';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

import { BEDROOM_TAB_OPTIONS, type TBedroomTabId } from './BedroomScreen.const';
import type { IBedroomScreenProps } from './BedroomScreen.typings';
import { styles } from './BedroomScreen.styles';

const BEDROOM_DEVICE_SLOTS: TBedroomDeviceSlot[] = [
  'light',
  'air_conditioner',
  'ventilation',
  'radiator',
  'curtains',
  'humidifier',
  'window',
];

const BEDROOM_SENSOR_SLOTS: TBedroomSensorSlot[] = [
  'temperature',
  'humidity',
  'co2',
  'pressure',
];

function isBedroomTabId(value: string): value is TBedroomTabId {
  return value === 'devices' || value === 'sensors';
}

function isBedroomDeviceSlot(value: string): value is TBedroomDeviceSlot {
  return BEDROOM_DEVICE_SLOTS.includes(value as TBedroomDeviceSlot);
}

function isBedroomSensorSlot(value: string): value is TBedroomSensorSlot {
  return BEDROOM_SENSOR_SLOTS.includes(value as TBedroomSensorSlot);
}

export function BedroomScreen({ initialTab }: IBedroomScreenProps) {
  const c = useThemeColors();
  const queryClient = useQueryClient();
  const { haReady } = useHaBackend();
  const deviceConfig = useBedroomDeviceStore((s) => s.config);
  const sensorOverrides = useBedroomSensorStore((s) => s.overrides);
  const hasActiveDevices = getActiveBedroomDeviceEntityIds(deviceConfig).length > 0;

  const [activeTab, setActiveTab] = useState<TBedroomTabId>(
    initialTab && isBedroomTabId(initialTab) ? initialTab : 'devices',
  );

  useEffect(() => {
    if (initialTab && isBedroomTabId(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabOptions = useMemo(
    () =>
      BEDROOM_TAB_OPTIONS.map((tab) => ({
        id: tab.id,
        label: copy.bedroom.tabs[tab.labelKey],
      })),
    [],
  );

  const devicesTabActive = activeTab === 'devices';
  const sensorsTabActive = activeTab === 'sensors';

  const {
    devices,
    isLoading: isDevicesLoading,
    isError: isDevicesError,
    isRefreshing: isDevicesRefreshing,
    pendingDeviceId,
    setSlider,
    setToggle,
    setSegment,
    refresh: refreshDevices,
  } = useBedroomControls({ enabled: devicesTabActive });

  const {
    readings,
    isLoading: isSensorsLoading,
    isError: isSensorsError,
    isRefreshing: isSensorsRefreshing,
  } = useBedroom({ enabled: sensorsTabActive });

  const isRefreshing =
    activeTab === 'devices' ? isDevicesRefreshing : isSensorsRefreshing;

  const handleRefresh = useCallback(async () => {
    if (activeTab === 'devices') {
      await refreshDevices();
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['bedroom-sensors'] });
  }, [activeTab, refreshDevices, queryClient]);

  return (
    <ScreenLayout
      variant="stack"
      onRefresh={haReady ? handleRefresh : undefined}
      isRefreshing={isRefreshing}
    >
      <CalmSegmented
        style={styles.tabs}
        options={tabOptions}
        value={activeTab}
        onValueChange={(next) => {
          if (isBedroomTabId(next)) {
            setActiveTab(next);
          }
        }}
      />

      {haReady && activeTab === 'devices' ? (
        <View style={styles.panel}>
          <CalmButton
            label={copy.bedroom.setupDevicesButton}
            variant="secondary"
            onPress={() => router.push('/bedroom-devices')}
          />
          {isDevicesLoading ? (
            <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.checking}</Text>
          ) : null}
          {isDevicesError && hasActiveDevices ? (
            <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.haUnavailable}</Text>
          ) : null}
          {!hasActiveDevices ? (
            <Text style={[typography.body, { color: c.textMuted }]}>
              {copy.bedroom.emptyDevicesHint}
            </Text>
          ) : null}
          {hasActiveDevices && devices ? (
            <BedroomDeviceControls
              devices={devices}
              pendingDeviceId={pendingDeviceId}
              onSliderComplete={(deviceId, value) => setSlider(deviceId, value)}
              onToggle={(deviceId, isOn) => setToggle(deviceId, isOn)}
              onSegmentSelect={(deviceId, optionId) => void setSegment(deviceId, optionId)}
              onConfigureDevice={(deviceId) => {
                if (!isBedroomDeviceSlot(deviceId)) return;
                router.push({ pathname: '/device-picker', params: { slot: deviceId } });
              }}
            />
          ) : null}
        </View>
      ) : null}

      {haReady && activeTab === 'sensors' ? (
        <View style={styles.panel}>
          {isSensorsLoading ? (
            <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.checking}</Text>
          ) : null}
          {isSensorsError ? (
            <Text style={[typography.body, { color: c.textMuted }]}>{copy.connection.haUnavailable}</Text>
          ) : null}
          <BedroomSensorControls
            readings={readings}
            overrides={sensorOverrides}
            onConfigureSensor={(slot) => {
              if (!isBedroomSensorSlot(slot)) return;
              router.push({ pathname: '/sensor-picker', params: { slot } });
            }}
          />
        </View>
      ) : null}
    </ScreenLayout>
  );
}
