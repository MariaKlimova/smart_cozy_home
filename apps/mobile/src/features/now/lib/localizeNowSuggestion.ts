import { copy } from '@/copy/ru';
import type {
  INowDeviceSuggestion,
  INowDeviceSuggestionRaw,
  INowSuggestion,
  INowSuggestionRaw,
  TNowSuggestionCopyKey,
} from '@/domain/nowSuggestion.typings';

function resolveCopyKey(key: TNowSuggestionCopyKey): string {
  return copy.now.suggestions[key];
}

function localizeDeviceSuggestion(raw: INowDeviceSuggestionRaw): INowDeviceSuggestion {
  const message = raw.messageKey ? resolveCopyKey(raw.messageKey) : (raw.message ?? '');
  let actionLabel = raw.actionLabel ?? '';
  if (!actionLabel && raw.actionLabelKey) {
    actionLabel = resolveCopyKey(raw.actionLabelKey);
  }

  return {
    kind: 'device',
    actionId: raw.actionId,
    message,
    actionLabel,
  };
}

/** Подставляет user-visible тексты из copy для device-предложений */
export function localizeNowSuggestion(suggestion: INowSuggestionRaw): INowSuggestion {
  if (suggestion.kind !== 'device') {
    return suggestion;
  }

  return localizeDeviceSuggestion(suggestion);
}
