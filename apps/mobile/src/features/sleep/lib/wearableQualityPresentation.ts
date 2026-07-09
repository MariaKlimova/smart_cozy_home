import type { TWearableSleepQualityTier } from '@/health/healthKitSleep.typings';
import { useThemeColors } from '@/hooks/useThemeColors';

type TThemeColors = ReturnType<typeof useThemeColors>;

/** Цвет оценки качества сна с трекера */
export function wearableQualityTierColor(tier: TWearableSleepQualityTier, c: TThemeColors): string {
  if (tier === 'excellent' || tier === 'good') {
    return c.success;
  }
  if (tier === 'fair') {
    return c.warning;
  }
  return c.danger;
}
