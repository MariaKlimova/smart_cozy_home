import type { TLightColorValue } from '@/domain/lightColor.typings';
import { setBooleanState, setNumberValue, setTextValue } from '@/ha/haClient';
import { getScenarioFieldEntityId } from '@/ha/mappers/mapScenarioSettings';
import { serializeScenarioLightColor } from '@/ha/mappers/scenarioLightColor';

/** Запись поля с pending/error/invalidate */
export type TExecuteWriteFn = (
  fieldKey: string,
  write: () => Promise<void>,
) => Promise<boolean>;

/** Контекст записи параметра сценария */
export interface IWriteScenarioParamContext {
  /** id сценария */
  scenarioId: string;
  /** Base URL HA */
  haBaseUrl: string;
  /** Token HA */
  haToken: string;
  /** Общий write-path */
  executeWrite: TExecuteWriteFn;
}

/** Записать числовой helper */
export async function writeScenarioNumber(
  ctx: IWriteScenarioParamContext,
  key: string,
  value: number,
): Promise<boolean> {
  const entityId = getScenarioFieldEntityId(ctx.scenarioId, key);
  if (!entityId) return false;
  return ctx.executeWrite(key, () =>
    setNumberValue(ctx.haBaseUrl, ctx.haToken, entityId, value),
  );
}

/** Записать булевый helper */
export async function writeScenarioBoolean(
  ctx: IWriteScenarioParamContext,
  key: string,
  value: boolean,
): Promise<boolean> {
  const entityId = getScenarioFieldEntityId(ctx.scenarioId, key);
  if (!entityId) return false;
  return ctx.executeWrite(key, () =>
    setBooleanState(ctx.haBaseUrl, ctx.haToken, entityId, value),
  );
}

/** Записать цветовой helper (JSON в input_text) */
export async function writeScenarioColor(
  ctx: IWriteScenarioParamContext,
  key: string,
  color: TLightColorValue,
): Promise<boolean> {
  const entityId = getScenarioFieldEntityId(ctx.scenarioId, key);
  if (!entityId) return false;
  return ctx.executeWrite(key, () =>
    setTextValue(ctx.haBaseUrl, ctx.haToken, entityId, serializeScenarioLightColor(color)),
  );
}

/** Записать текстовый helper (plain string в input_text) */
export async function writeScenarioText(
  ctx: IWriteScenarioParamContext,
  key: string,
  value: string,
): Promise<boolean> {
  const entityId = getScenarioFieldEntityId(ctx.scenarioId, key);
  if (!entityId) return false;
  const trimmed = value.trim();
  return ctx.executeWrite(key, () =>
    setTextValue(ctx.haBaseUrl, ctx.haToken, entityId, trimmed),
  );
}
