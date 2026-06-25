import { loadHomeConfig } from '@/config/homeConfig';
import { runHaScript } from '@/ha/haClient';
import type { IRitual } from '@/domain/types';

export function listRituals(): IRitual[] {
  const config = loadHomeConfig();
  return Object.entries(config.rituals).map(([id, r]) => ({
    id,
    label: r.label,
    icon: r.icon,
  }));
}

export async function runRitual(ritualId: string, baseUrl: string, token: string): Promise<void> {
  const config = loadHomeConfig();
  const mapping = config.rituals[ritualId];
  if (!mapping) {
    throw new Error(`Unknown ritual: ${ritualId}`);
  }
  await runHaScript(baseUrl, token, mapping.script);
}
