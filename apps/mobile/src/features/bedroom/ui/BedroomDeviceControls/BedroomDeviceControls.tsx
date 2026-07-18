import { View } from 'react-native';

import { BedroomDeviceControlsCard } from './-Card';

import type { IBedroomDeviceControlsProps } from './BedroomDeviceControls.typings';
import { styles } from './BedroomDeviceControls.styles';

export function BedroomDeviceControls({
  devices,
  pendingDeviceId,
  showConfigure = true,
  onSliderComplete,
  onToggle,
  onSegmentSelect,
  onColorLightChange,
  onVisibleMinComplete,
  onConfigureDevice,
}: IBedroomDeviceControlsProps) {
  return (
    <View style={styles.list}>
      {devices.map((device) => (
        <BedroomDeviceControlsCard
          key={device.id}
          device={device}
          isPending={pendingDeviceId === device.id}
          showConfigure={showConfigure}
          onSliderComplete={(value) => onSliderComplete(device.id, value)}
          onToggle={(isOn) => onToggle(device.id, isOn)}
          onSegmentSelect={(optionId) => onSegmentSelect(device.id, optionId)}
          onColorLightChange={
            onColorLightChange
              ? (brightness, colorPresetId) =>
                  onColorLightChange(device.id, brightness, colorPresetId)
              : undefined
          }
          onVisibleMinComplete={
            device.id === 'light' && onVisibleMinComplete
              ? onVisibleMinComplete
              : undefined
          }
          onConfigure={
            onConfigureDevice ? () => onConfigureDevice(device.id) : undefined
          }
        />
      ))}
    </View>
  );
}
