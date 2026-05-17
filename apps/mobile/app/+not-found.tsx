import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { copy } from '@/copy/ru';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: copy.notFound.screenTitle }} />
      <View style={styles.container}>
        <Text style={styles.title}>{copy.notFound.title}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{copy.notFound.link}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
