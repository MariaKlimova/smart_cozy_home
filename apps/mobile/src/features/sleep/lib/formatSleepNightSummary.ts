import { copy } from '@/copy/ru';
import type {
  ISleepNightSummary,
  TSleepNightIssueKey,
  TSleepNightScore,
} from '@/domain/sleepNight.typings';

/** Сводная метрика ночи для шторы */
export interface ISleepNightMetricItem {
  /** Эмодзи-префикс */
  emoji: string;
  /** Подпись метрики */
  label: string;
  /** Значение для отображения */
  value: string;
}

/** Подпись итоговой оценки ночи */
export function sleepScoreLabel(score: TSleepNightScore): string {
  if (score === 'good') {
    return copy.sleep.scoreGood;
  }
  if (score === 'fair') {
    return copy.sleep.scoreFair;
  }
  if (score === 'poor') {
    return copy.sleep.scorePoor;
  }
  return copy.sleep.scoreNoData;
}

/** Эмодзи для причины отклонения */
export function sleepIssueEmoji(issueKey: TSleepNightIssueKey): string {
  if (issueKey === 'co2High') {
    return '💨';
  }
  if (issueKey === 'tempHigh') {
    return '🌡️';
  }
  if (issueKey === 'tempLow') {
    return '❄️';
  }
  return '💧';
}

/** Тексты причин отклонений для UI */
export function formatSleepNightIssueTexts(issues: TSleepNightIssueKey[]): string[] {
  return issues.map((issueKey) => copy.sleep.issues[issueKey]);
}

/** Сводные метрики ночи для шторы */
export function formatSleepNightMetrics(night: ISleepNightSummary): ISleepNightMetricItem[] {
  const items: ISleepNightMetricItem[] = [];

  if (night.co2MinPpm !== undefined && night.co2MaxPpm !== undefined) {
    items.push({
      emoji: '🫁',
      label: copy.sleep.metrics.co2Range,
      value: `${night.co2MinPpm}–${night.co2MaxPpm} ${copy.sleep.metrics.ppmUnit}`,
    });
  }

  if (night.tempAvgC !== undefined) {
    const rounded = Math.round(night.tempAvgC * 10) / 10;
    items.push({
      emoji: '🌡️',
      label: copy.sleep.metrics.tempAvg,
      value: `${rounded}°`,
    });
  }

  if (night.humidityAvgPct !== undefined) {
    items.push({
      emoji: '💧',
      label: copy.sleep.metrics.humidityAvg,
      value: `${Math.round(night.humidityAvgPct)}%`,
    });
  }

  return items;
}
