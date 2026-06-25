import { View } from 'react-native';

import { BedroomDeviceControlsCard } from './-Card';

import type { IBedroomDeviceControlsProps } from './BedroomDeviceControls.typings';
import { styles } from './BedroomDeviceControls.styles';

export function BedroomDeviceControls({
  devices,
  pendingDeviceId,
  onSliderComplete,
  onToggle,
  onSegmentSelect,
  onConfigureDevice,
}: IBedroomDeviceControlsProps) {
  return (
    <View style={styles.list}>
      {devices.map((device) => (
        <BedroomDeviceControlsCard
          key={device.id}
          device={device}
          isPending={pendingDeviceId === device.id}
          onSliderComplete={(value) => onSliderComplete(device.id, value)}
          onToggle={(isOn) => onToggle(device.id, isOn)}
          onSegmentSelect={(optionId) => onSegmentSelect(device.id, optionId)}
          onConfigure={() => onConfigureDevice(device.id)}
        />
      ))}
    </View>
  );
}
