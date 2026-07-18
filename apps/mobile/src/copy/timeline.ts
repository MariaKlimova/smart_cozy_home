import { copy } from '@/copy/ru';
import type { ITimelineEvent } from '@/domain/types';

const PERSON_HOME: Record<string, string> = {
  'person.maria': 'Ты пришла домой',
};

const RITUAL_LABELS: Record<string, string> = {
  evening: 'Включён вечерний режим',
  sleep: 'Включён режим сна',
};

export function humanizeTimelineEvent(event: ITimelineEvent): string {
  if (event.kind === 'presence_home' && event.entityId && PERSON_HOME[event.entityId]) {
    return PERSON_HOME[event.entityId];
  }
  if (event.kind === 'ritual' && event.ritualId && RITUAL_LABELS[event.ritualId]) {
    return RITUAL_LABELS[event.ritualId];
  }
  if (event.message.trim().length > 0) {
    return event.message;
  }
  return copy.timeline.genericEvent;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return 'вчера';
}
