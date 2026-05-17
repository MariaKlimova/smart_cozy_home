import { View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import type { ICalmCardProps } from './CalmCard.typings';
import { paddingStyles, styles } from './CalmCard.styles';

export function CalmCard({
  children,
  style,
  padding = 'lg',
  variant = 'elevated',
  tone = 'default',
}: ICalmCardProps) {
  const c = useThemeColors();
  const isOutline = variant === 'outline';
  const isMuted = tone === 'muted';

  let backgroundColor: string = c.surface;
  if (isOutline) {
    backgroundColor = 'transparent';
  } else if (isMuted) {
    backgroundColor = c.accentMuted;
  }

  return (
    <View
      style={[
        styles.card,
        paddingStyles[padding],
        { backgroundColor, borderColor: c.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}
