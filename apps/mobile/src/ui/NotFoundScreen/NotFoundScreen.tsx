import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';

import type { INotFoundScreenProps } from './NotFoundScreen.typings';
import { styles } from './NotFoundScreen.styles';

export function NotFoundScreen(_props: INotFoundScreenProps) {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>{copy.notFound.title}</Text>
      <Link href="/" style={styles.link}>
        <Text style={[styles.linkText, { color: c.accent }]}>{copy.notFound.link}</Text>
      </Link>
    </View>
  );
}
