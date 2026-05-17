import { StyleSheet } from 'react-native';

import { touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  wrap: {
    minHeight: touchMin,
    minWidth: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
