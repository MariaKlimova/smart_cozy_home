import type { IScenarioFieldDefinition } from '@/config/scenarioSettingsFields';
import { copy } from '@/copy/ru';

/** Подпись поля настроек из copy */
export function getScenarioFieldLabel(field: IScenarioFieldDefinition): string {
  const fields = copy.scenarios.settingsFields as Record<string, string>;
  return fields[field.copyKey] ?? field.copyKey;
}
