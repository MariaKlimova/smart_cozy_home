import { forwardRef, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';
import { ConnectionBanner } from '@/ui/ConnectionBanner';

import { SCREEN_LAYOUT_KEYBOARD_PADDING_MULTIPLIER } from './ScreenLayout.const';
import type { IScreenLayoutWithRefreshProps } from './ScreenLayout.typings';
import { styles } from './ScreenLayout.styles';

export const ScreenLayout = forwardRef<ScrollViewType, IScreenLayoutWithRefreshProps>(
  function ScreenLayout(
    { title, variant = 'tab', children, onRefresh, isRefreshing, keyboardAware = false, showConnectionBanner = true },
    forwardedRef,
  ) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const innerRef = useRef<ScrollViewType>(null);
    const isStack = variant === 'stack';

    const scrollRef = (node: ScrollViewType | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const keyboardBottomPadding = keyboardAware
      ? spacing.xl * SCREEN_LAYOUT_KEYBOARD_PADDING_MULTIPLIER
      : spacing.xl;

    return (
      <KeyboardAvoidingView
        style={[
          styles.root,
          { backgroundColor: c.background, paddingTop: isStack ? 0 : insets.top },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={keyboardAware}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={keyboardAware}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + keyboardBottomPadding },
          ]}
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
      </KeyboardAvoidingView>
    );
  },
);
