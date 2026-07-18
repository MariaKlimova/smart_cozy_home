import { Text } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { styles } from './RoomsStatusHint.styles';
import type { IRoomsStatusHintProps } from './RoomsStatusHint.typings';

function formatSyncTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU');
}

export function RoomsStatusHint({ message, lastSyncAt }: IRoomsStatusHintProps) {
  const c = useThemeColors();
  const syncSuffix =
    lastSyncAt === null
      ? null
      : copy.rooms.lastSyncSuffix.replace('{time}', formatSyncTime(lastSyncAt));

  return (
    <Text style={[typography.caption, styles.text, { color: c.textMuted }]}>
      {message}
      {syncSuffix}
    </Text>
  );
}
