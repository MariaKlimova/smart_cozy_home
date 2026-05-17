import { useColorScheme } from '@/hooks/useColorScheme';
import { colors } from '@/theme/tokens';

export function useThemeColors() {
  const scheme = useColorScheme();
  return colors[scheme];
}
