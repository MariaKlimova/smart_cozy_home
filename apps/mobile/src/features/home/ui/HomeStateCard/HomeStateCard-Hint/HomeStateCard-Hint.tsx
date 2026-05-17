import { Text } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IHomeStateCardHintProps } from './HomeStateCard-Hint.typings';
import { styles } from './HomeStateCard-Hint.styles';

export function HomeStateCardHint({ text }: IHomeStateCardHintProps) {
  const c = useThemeColors();
  return (
    <Text style={[typography.body, styles.hint, { color: c.textMuted }]}>{text}</Text>
  );
}
