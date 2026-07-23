import type { IScenarioFieldDefinition } from '@/config/scenarioSettingsFields';
import { copy } from '@/copy/ru';

function settingsFieldsCopy(): Record<string, string> {
  return copy.scenarios.settingsFields as Record<string, string>;
}

/** Подпись поля настроек из copy */
export function getScenarioFieldLabel(field: IScenarioFieldDefinition): string {
  const fields = settingsFieldsCopy();
  return fields[field.copyKey] ?? field.copyKey;
}

/** Опциональная строка из settingsFields по ключу (hint / placeholder) */
export function getScenarioSettingsFieldCopy(copyKey: string | undefined): string | undefined {
  if (!copyKey) {
    return undefined;
  }
  return settingsFieldsCopy()[copyKey];
}
