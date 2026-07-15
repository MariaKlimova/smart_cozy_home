import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import type {
  IBedroomColorLightValue,
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

import { BedroomDeviceControlsColorPresets } from '../-ColorPresets';
import { TOGGLE_STALE_REMOTE_IGNORE_MS } from './BedroomDeviceControls-Card.const';
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

function isColorLightValue(value: unknown): value is IBedroomColorLightValue {
  return typeof value === 'object' && value !== null && 'brightness' in value && 'colorPresets' in value;
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
  showConfigure = true,
  onSliderComplete,
  onToggle,
  onSegmentSelect,
  onColorLightChange,
  onConfigure,
}: IBedroomDeviceControlsCardProps) {
  const c = useThemeColors();
  const controlsDisabled = !device.isAvailable || isPending;
  const toggleDisabled = !device.isAvailable;
  const sliderValue = isSliderValue(device.value) ? device.value : undefined;
  const colorLightValue = isColorLightValue(device.value) ? device.value : undefined;
  const sliderCurrent = sliderValue?.current;
  const colorBrightness = colorLightValue?.brightness;
  const remoteToggleOn = isToggleValue(device.value) ? device.value.isOn : false;
  const [localSliderValue, setLocalSliderValue] = useState(
    sliderCurrent ?? colorBrightness ?? device.slider?.min ?? 0,
  );
  const [localToggleOn, setLocalToggleOn] = useState(remoteToggleOn);
  const toggleInFlightRef = useRef(false);
  /** Ждём, пока remote станет равен этому значению после нашей команды */
  const expectedToggleRef = useRef<boolean | null>(null);
  const ignoreStaleUntilRef = useRef(0);

  useEffect(() => {
    expectedToggleRef.current = null;
    ignoreStaleUntilRef.current = 0;
    setLocalToggleOn(isToggleValue(device.value) ? device.value.isOn : false);
    // Сброс только при смене устройства в списке
    // eslint-disable-next-line react-hooks/exhaustive-deps -- device.id gate
  }, [device.id]);

  useEffect(() => {
    if (sliderCurrent !== undefined) {
      setLocalSliderValue(sliderCurrent);
      return;
    }
    if (colorBrightness !== undefined) {
      setLocalSliderValue(colorBrightness);
    }
  }, [sliderCurrent, colorBrightness, device.id]);

  useEffect(() => {
    const expected = expectedToggleRef.current;
    if (expected !== null) {
      if (remoteToggleOn === expected) {
        // HA (или optimistic cache) совпал — больше не ждём expected,
        // но ещё TOGGLE_STALE_REMOTE_IGNORE_MS игнорируем откат на stale refetch
        expectedToggleRef.current = null;
      }
      return;
    }

    if (Date.now() < ignoreStaleUntilRef.current) {
      return;
    }

    setLocalToggleOn(remoteToggleOn);
  }, [remoteToggleOn]);

  useEffect(() => {
    if (expectedToggleRef.current === null && Date.now() >= ignoreStaleUntilRef.current) {
      return;
    }

    const remaining = ignoreStaleUntilRef.current - Date.now();
    const delay = remaining > 0 ? remaining : TOGGLE_STALE_REMOTE_IGNORE_MS;
    const timer = setTimeout(() => {
      expectedToggleRef.current = null;
      ignoreStaleUntilRef.current = 0;
      setLocalToggleOn(remoteToggleOn);
    }, delay);

    return () => clearTimeout(timer);
  }, [localToggleOn, remoteToggleOn]);

  let valueCaption: string | undefined;
  if (sliderValue) {
    valueCaption = formatSliderValue(sliderValue);
  } else if (colorLightValue) {
    valueCaption = `${colorLightValue.brightness} %`;
  }

  async function handleSliderComplete(value: number) {
    const applied = await onSliderComplete(value);
    if (!applied) {
      if (sliderCurrent !== undefined) {
        setLocalSliderValue(sliderCurrent);
      } else if (colorBrightness !== undefined) {
        setLocalSliderValue(colorBrightness);
      }
    }
  }

  async function handleToggle(next: boolean) {
    if (toggleInFlightRef.current || toggleDisabled) return;
    toggleInFlightRef.current = true;
    const previous = localToggleOn;
    expectedToggleRef.current = next;
    ignoreStaleUntilRef.current = Date.now() + TOGGLE_STALE_REMOTE_IGNORE_MS;
    setLocalToggleOn(next);
    try {
      const applied = await onToggle(next);
      if (!applied) {
        expectedToggleRef.current = null;
        ignoreStaleUntilRef.current = 0;
        setLocalToggleOn(previous);
      }
    } finally {
      toggleInFlightRef.current = false;
    }
  }

  async function handleColorLightSlider(value: number) {
    if (!colorLightValue || !onColorLightChange) {
      return;
    }
    const presetId =
      colorLightValue.colorPresetId ?? colorLightValue.colorPresets[0]?.id;
    if (!presetId) {
      return;
    }
    const applied = await onColorLightChange(value, presetId);
    if (!applied && colorBrightness !== undefined) {
      setLocalSliderValue(colorBrightness);
    }
  }

  function handleColorPresetSelect(presetId: string) {
    if (!colorLightValue || !onColorLightChange) {
      return;
    }
    const brightness = Math.max(localSliderValue, 1);
    void onColorLightChange(brightness, presetId);
  }

  return (
    <CalmCard padding="md" style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.subtitle, styles.title, { color: c.text }]}>{device.label}</Text>
        {showConfigure && onConfigure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${device.label}. ${copy.bedroom.configureDeviceA11y}`}
            onPress={onConfigure}
            style={styles.configureButton}
            hitSlop={8}
          >
            <FontAwesome name="cog" size={18} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controlSection}>
        {!device.isAvailable ? (
          <Text style={[typography.caption, { color: c.textMuted }]}>{copy.bedroom.unavailable}</Text>
        ) : null}
        {device.isAvailable && valueCaption &&
        (device.control === 'slider' || device.control === 'color_light') ? (
          <Text style={[typography.caption, { color: c.textMuted }]}>{valueCaption}</Text>
        ) : null}

        {device.control === 'toggle' ? (
          <View style={styles.controlRow}>
            <CalmToggle
              value={localToggleOn}
              onValueChange={(value) => void handleToggle(value)}
              disabled={toggleDisabled}
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
            disabled={controlsDisabled}
            accessibilityLabel={device.label}
          />
        ) : null}

        {device.control === 'color_light' && device.slider ? (
          <>
            <CalmSlider
              value={localSliderValue}
              onValueChange={setLocalSliderValue}
              onSlidingComplete={(value) => void handleColorLightSlider(value)}
              minimumValue={device.slider.min}
              maximumValue={device.slider.max}
              step={device.slider.step}
              disabled={controlsDisabled}
              accessibilityLabel={device.label}
            />
            {colorLightValue && colorLightValue.colorPresets.length > 0 ? (
              <BedroomDeviceControlsColorPresets
                presets={colorLightValue.colorPresets}
                activePresetId={colorLightValue.colorPresetId}
                disabled={controlsDisabled || localSliderValue <= 0}
                onSelect={handleColorPresetSelect}
              />
            ) : null}
          </>
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
            disabled={controlsDisabled}
          />
        ) : null}
      </View>
    </CalmCard>
  );
}
