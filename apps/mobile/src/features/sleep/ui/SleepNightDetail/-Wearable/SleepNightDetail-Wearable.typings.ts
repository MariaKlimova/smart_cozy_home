import type { IWearableSleepNightResult } from '@/health/healthKitSleep.typings';

export interface ISleepNightDetailWearableProps {
  /** Результат загрузки wearable */
  wearable: IWearableSleepNightResult | null;
  /** Идёт загрузка */
  isLoading: boolean;
  /** Запросить доступ в настройках */
  onOpenSettings?: () => void;
}
