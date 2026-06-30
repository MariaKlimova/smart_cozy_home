import { View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import { styles } from './BedroomStateCard-Skeleton.styles';

export function BedroomStateCardSkeleton() {
  const c = useThemeColors();

  return (
    <View style={styles.root}>
      <View style={[styles.titleBar, { backgroundColor: c.border }]} />
      <View style={styles.metricsRow}>
        <View style={[styles.metricChip, { backgroundColor: c.border }]} />
        <View style={[styles.metricChip, { backgroundColor: c.border }]} />
        <View style={[styles.metricChip, { backgroundColor: c.border }]} />
      </View>
      <View style={[styles.sectionTitleBar, { backgroundColor: c.border }]} />
      <View style={styles.metricsRow}>
        <View style={[styles.metricChip, { backgroundColor: c.border }]} />
        <View style={[styles.metricChip, { backgroundColor: c.border }]} />
      </View>
    </View>
  );
}
