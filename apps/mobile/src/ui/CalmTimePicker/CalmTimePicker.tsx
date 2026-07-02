import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

import type { ICalmTimePickerProps } from './CalmTimePicker.typings';
import { styles } from './CalmTimePicker.styles';

function parseTimeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

function formatDateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function CalmTimePicker({
  value,
  onTimeChange,
  accessibilityLabel,
  disabled,
  style,
}: ICalmTimePickerProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);
  const [draftTime, setDraftTime] = useState(value);
  const pickerDate = parseTimeToDate(value);

  useEffect(() => {
    if (!showPicker) {
      setDraftTime(value);
    }
  }, [value, showPicker]);

  function openPicker() {
    if (disabled) {
      return;
    }
    setDraftTime(value);
    setShowPicker(true);
  }

  function closePicker() {
    setShowPicker(false);
  }

  function confirmPicker() {
    onTimeChange(draftTime);
    closePicker();
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selected) {
      return;
    }
    onTimeChange(formatDateToTime(selected));
  }

  function handleIosChange(_event: DateTimePickerEvent, selected?: Date) {
    if (!selected) {
      return;
    }
    setDraftTime(formatDateToTime(selected));
  }

  const textColor = disabled ? c.textMuted : c.text;
  const borderColor = disabled ? 'transparent' : c.border;
  const backgroundColor = disabled ? c.background : c.surface;

  return (
    <>
      <View style={style}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }: { pressed: boolean }) => {
            let buttonOpacity = 1;
            if (disabled) {
              buttonOpacity = 0.55;
            } else if (pressed) {
              buttonOpacity = 0.85;
            }

            return [
              styles.button,
              {
                backgroundColor,
                borderColor,
                opacity: buttonOpacity,
              },
            ];
          }}
        >
          <Text style={[typography.subtitle, styles.time, { color: textColor }]}>{value}</Text>
        </Pressable>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={closePicker}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={closePicker} />
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  paddingBottom: Math.max(insets.bottom, spacing.md),
                },
              ]}
            >
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={parseTimeToDate(draftTime)}
                  mode="time"
                  is24Hour
                  display="spinner"
                  onChange={handleIosChange}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.common.done}
                onPress={confirmPicker}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.doneButton,
                  {
                    backgroundColor: c.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[typography.subtitle, { color: c.onAccent }]}>
                  {copy.common.done}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}
    </>
  );
}
