import { useEffect, useRef } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import {
  CALM_SHEET,
  CALM_SHEET_ANIMATION_MS,
  CALM_SHEET_DISMISS_DRAG_PX,
  CALM_SHEET_MAX_HEIGHT_RATIO,
} from './CalmSheet.const';
import type { ICalmSheetProps } from './CalmSheet.typings';
import { styles } from './CalmSheet.styles';

export function CalmSheet({ visible, title, subtitle, onClose, children }: ICalmSheetProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useSharedValue(windowHeight);
  const backdropOpacity = useSharedValue(0);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  const dismissSheet = () => {
    onCloseRef.current();
  };

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: CALM_SHEET_ANIMATION_MS });
      backdropOpacity.value = withTiming(1, { duration: CALM_SHEET_ANIMATION_MS });
      return;
    }

    translateY.value = withTiming(windowHeight, { duration: CALM_SHEET_ANIMATION_MS });
    backdropOpacity.value = withTiming(0, { duration: CALM_SHEET_ANIMATION_MS });
  }, [visible, translateY, backdropOpacity, windowHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.value = gesture.dy;
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > CALM_SHEET_DISMISS_DRAG_PX) {
          translateY.value = withTiming(windowHeight, { duration: CALM_SHEET_ANIMATION_MS }, () => {
            runOnJS(dismissSheet)();
          });
          backdropOpacity.value = withTiming(0, { duration: CALM_SHEET_ANIMATION_MS });
          return;
        }

        translateY.value = withTiming(0, { duration: CALM_SHEET_ANIMATION_MS });
      },
    }),
  ).current;

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const maxSheetHeight = windowHeight * CALM_SHEET_MAX_HEIGHT_RATIO;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={CALM_SHEET}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть"
          onPress={onClose}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              backgroundColor: c.surface,
              maxHeight: maxSheetHeight,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View style={[styles.handle, { backgroundColor: c.border }]} />
          </View>

          <Text style={[typography.subtitle, styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[typography.caption, styles.subtitle, { color: c.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
