import { forwardRef } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';
import { ConnectionBanner } from '@/ui/ConnectionBanner';

import { SCREEN_LAYOUT_KEYBOARD_GAP } from './ScreenLayout.const';
import type { IScreenLayoutWithRefreshProps } from './ScreenLayout.typings';
import { styles } from './ScreenLayout.styles';

export const ScreenLayout = forwardRef<ScrollViewType, IScreenLayoutWithRefreshProps>(
  function ScreenLayout(
    {
      title,
      variant = 'tab',
      children,
      onRefresh,
      isRefreshing,
      keyboardAware = false,
      showConnectionBanner = true,
    },
    forwardedRef,
  ) {
    const c = useThemeColors();
    const insets = useSafeAreaInsets();
    const isStack = variant === 'stack';

    const contentStyle = [styles.content, { paddingBottom: insets.bottom + spacing.xl }];

    const refreshControl = onRefresh ? (
      <RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} tintColor={c.accent} />
    ) : undefined;

    const inner = (
      <>
        {title && !isStack ? (
          <Text style={[typography.title, styles.title, { color: c.text }]}>{title}</Text>
        ) : null}
        {showConnectionBanner ? <ConnectionBanner /> : null}
        {children}
      </>
    );

    return (
      <View
        style={[
          styles.root,
          { backgroundColor: c.background, paddingTop: isStack ? 0 : insets.top },
        ]}
      >
        {keyboardAware ? (
          // KeyboardAwareScrollView (keyboard-controller) сам подскролливает фокусное поле
          // над клавиатурой на обеих платформах, включая Android 15 edge-to-edge,
          // где adjustResize больше не сжимает окно.
          <KeyboardAwareScrollView
            ref={forwardedRef}
            bottomOffset={SCREEN_LAYOUT_KEYBOARD_GAP}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={contentStyle}
            refreshControl={refreshControl}
          >
            {inner}
          </KeyboardAwareScrollView>
        ) : (
          <ScrollView
            ref={forwardedRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={contentStyle}
            refreshControl={refreshControl}
          >
            {inner}
          </ScrollView>
        )}
      </View>
    );
  },
);
