import { forwardRef, useRef } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';
import { ConnectionBanner } from '@/ui/ConnectionBanner';

import { SCREEN_LAYOUT_KEYBOARD_GAP } from './ScreenLayout.const';
import type { IScreenLayoutWithRefreshProps } from './ScreenLayout.typings';
import { styles } from './ScreenLayout.styles';
import { useKeyboardHeight } from './useKeyboardHeight';

export const ScreenLayout = forwardRef<ScrollViewType, IScreenLayoutWithRefreshProps>(
  function ScreenLayout(
    { title, variant = 'tab', children, onRefresh, isRefreshing, keyboardAware = false, showConnectionBanner = true },
    forwardedRef,
  ) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const innerRef = useRef<ScrollViewType>(null);
    const isStack = variant === 'stack';
    const keyboardHeight = useKeyboardHeight(keyboardAware);

    const scrollRef = (node: ScrollViewType | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    // iOS: contentInset = высота клавиатуры + зазор — поле остаётся чуть выше клавиатуры.
    // Android: окно уже resize; добавляем только небольшой gap в padding снизу.
    const iosKeyboardInset =
      keyboardAware && Platform.OS === 'ios' && keyboardHeight > 0
        ? keyboardHeight + SCREEN_LAYOUT_KEYBOARD_GAP
        : 0;

    const paddingBottom =
      insets.bottom +
      spacing.xl +
      (keyboardAware && Platform.OS === 'android' && keyboardHeight > 0
        ? SCREEN_LAYOUT_KEYBOARD_GAP
        : 0);

    return (
      <View
        style={[
          styles.root,
          { backgroundColor: c.background, paddingTop: isStack ? 0 : insets.top },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={false}
          contentInsetAdjustmentBehavior={keyboardAware ? 'never' : 'automatic'}
          contentInset={iosKeyboardInset > 0 ? { bottom: iosKeyboardInset } : undefined}
          scrollIndicatorInsets={iosKeyboardInset > 0 ? { bottom: iosKeyboardInset } : undefined}
          contentContainerStyle={[styles.content, { paddingBottom }]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!isRefreshing}
                onRefresh={onRefresh}
                tintColor={c.accent}
              />
            ) : undefined
          }
        >
          {title && !isStack ? (
            <Text style={[typography.title, styles.title, { color: c.text }]}>{title}</Text>
          ) : null}
          {showConnectionBanner ? <ConnectionBanner /> : null}
          {children}
        </ScrollView>
      </View>
    );
  },
);
