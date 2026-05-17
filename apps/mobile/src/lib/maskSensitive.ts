/** Маскирует токен для отображения в UI */
export function maskToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return '(пусто)';
  if (trimmed.length <= 8) return `*** (${trimmed.length} симв.)`;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

/** URL без учётных данных */
export function maskUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '(не задан)';
  try {
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
  }
}
