import { StyleSheet } from 'react-native';

import { touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  wrap: {
    minHeight: touchMin,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
