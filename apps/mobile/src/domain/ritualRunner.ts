import { loadRitualsConfig } from '@/config/ritualsConfig';
import { callHaService } from '@/ha/haClient';
import type { IRitual } from '@/domain/types';

export function listRituals(): IRitual[] {
  const config = loadRitualsConfig();
  return Object.entries(config.rituals).map(([id, r]) => ({
    id,
    label: r.label,
    icon: r.icon,
  }));
}

export async function runRitual(ritualId: string, baseUrl: string, token: string): Promise<void> {
  const config = loadRitualsConfig();
  const mapping = config.rituals[ritualId];
  if (!mapping) {
    throw new Error(`Unknown ritual: ${ritualId}`);
  }
  const [domain, service] = parseScriptEntity(mapping.script);
  await callHaService(baseUrl, token, domain, service);
}

function parseScriptEntity(scriptEntity: string): [string, string] {
  const parts = scriptEntity.split('.');
  if (parts.length !== 2) {
    throw new Error(`Invalid script entity: ${scriptEntity}`);
  }
  return [parts[0], parts[1]];
}
