import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { getScenarioDefinition } from '@/features/scenarios/config/scenarios';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

export default function ScenarioSettingsScreen() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = typeof id === 'string' ? getScenarioDefinition(id) : undefined;
  const title = scenario?.label ?? copy.scenarios.sectionTitle;

  return (
    <>
      <Stack.Screen options={{ title, headerBackTitle: copy.scenarios.sectionTitle }} />
      <ScreenLayout variant="stack">
        <View>
          <Text style={[typography.body, { color: c.textMuted }]}>
            {copy.scenarios.settingsPlaceholder}
          </Text>
        </View>
      </ScreenLayout>
    </>
  );
}
