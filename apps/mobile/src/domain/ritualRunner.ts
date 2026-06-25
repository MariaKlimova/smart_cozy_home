import { loadRitualsConfig } from '@/config/ritualsConfig';
import { runHaScript } from '@/ha/haClient';
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
  await runHaScript(baseUrl, token, mapping.script);
}
