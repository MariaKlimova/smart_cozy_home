import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import type {
  IBedroomSegmentedValue,
  IBedroomSliderValue,
  IBedroomToggleValue,
} from '@/domain/bedroomDevice.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { CalmSegmented } from '@/ui/CalmSegmented';
import { CalmSlider } from '@/ui/CalmSlider';
import { CalmToggle } from '@/ui/CalmToggle';
import { typography } from '@/theme/tokens';

import type { IBedroomDeviceControlsCardProps } from './BedroomDeviceControls-Card.typings';
import { styles } from './BedroomDeviceControls-Card.styles';

function isSliderValue(value: unknown): value is IBedroomSliderValue {
  return typeof value === 'object' && value !== null && 'current' in value;
}

function isToggleValue(value: unknown): value is IBedroomToggleValue {
  return typeof value === 'object' && value !== null && 'isOn' in value;
}

function isSegmentedValue(value: unknown): value is IBedroomSegmentedValue {
  return typeof value === 'object' && value !== null && 'activeOptionId' in value;
}

function formatSliderValue(value: IBedroomSliderValue): string {
  if (value.unit) {
    return `${value.current} ${value.unit}`;
  }
  return String(value.current);
}

export function BedroomDeviceControlsCard({
  device,
  isPending,
  onSliderComplete,
  onToggle,
  onSegmentSelect,
  onConfigure,
}: IBedroomDeviceControlsCardProps) {
  const c = useThemeColors();
  const disabled = !device.isAvailable || isPending;
  const sliderValue = isSliderValue(device.value) ? device.value : undefined;
  const sliderCurrent = sliderValue?.current;
  const [localSliderValue, setLocalSliderValue] = useState(
    sliderCurrent ?? device.slider?.min ?? 0,
  );

  useEffect(() => {
    if (sliderCurrent !== undefined) {
      setLocalSliderValue(sliderCurrent);
    }
  }, [sliderCurrent, device.id]);

  let valueCaption: string | undefined;
  if (sliderValue) {
    valueCaption = formatSliderValue(sliderValue);
  }

  async function handleSliderComplete(value: number) {
    const applied = await onSliderComplete(value);
    if (!applied && sliderCurrent !== undefined) {
      setLocalSliderValue(sliderCurrent);
    }
  }

  return (
    <CalmCard padding="md" style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.subtitle, styles.title, { color: c.text }]}>{device.label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${device.label}. ${copy.bedroom.configureDeviceA11y}`}
          onPress={onConfigure}
          style={styles.configureButton}
          hitSlop={8}
        >
          <FontAwesome name="cog" size={18} color={c.textMuted} />
        </Pressable>
      </View>

      <View style={styles.controlSection}>
        {!device.isAvailable ? (
          <Text style={[typography.caption, { color: c.textMuted }]}>{copy.bedroom.unavailable}</Text>
        ) : null}
        {device.isAvailable && valueCaption && device.control === 'slider' ? (
          <Text style={[typography.caption, { color: c.textMuted }]}>{valueCaption}</Text>
        ) : null}

        {device.control === 'toggle' ? (
          <View style={styles.controlRow}>
            <CalmToggle
              value={isToggleValue(device.value) ? device.value.isOn : false}
              onValueChange={onToggle}
              disabled={disabled}
              accessibilityLabel={device.label}
            />
          </View>
        ) : null}

        {device.control === 'slider' && device.slider ? (
          <CalmSlider
            value={localSliderValue}
            onValueChange={setLocalSliderValue}
            onSlidingComplete={(value) => void handleSliderComplete(value)}
            minimumValue={device.slider.min}
            maximumValue={device.slider.max}
            step={device.slider.step}
            disabled={disabled}
            accessibilityLabel={device.label}
          />
        ) : null}

        {device.control === 'segmented' && device.segmentOptions ? (
          <CalmSegmented
            options={device.segmentOptions}
            value={
              isSegmentedValue(device.value)
                ? device.value.activeOptionId
                : device.segmentOptions[0].id
            }
            onValueChange={onSegmentSelect}
            disabled={disabled}
          />
        ) : null}
      </View>
    </CalmCard>
  );
}
