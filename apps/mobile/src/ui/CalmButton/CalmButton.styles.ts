import { StyleSheet } from 'react-native';

import { touchMin } from '@/theme/tokens';

export const styles = StyleSheet.create({
  base: {
    minHeight: touchMin,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
