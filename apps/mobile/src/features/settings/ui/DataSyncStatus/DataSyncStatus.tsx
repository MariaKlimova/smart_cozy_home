import { StyleSheet, Text, View } from 'react-native';

import type { IDataSyncStatusProps } from '@/features/settings/ui/DataSyncStatus/DataSyncStatus.typings';
import { CalmButton } from '@/ui/CalmButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

function formatSyncTime(iso: string | null): string {
  if (!iso) return 'ещё не было';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function DataSyncStatus({
  isConnected,
  baseUrl,
  syncDebug,
  isRefreshing,
  onRefresh,
}: IDataSyncStatusProps) {
  const c = useThemeColors();
  const hasData = syncDebug.entitiesReceived > 0;
  const allFound =
    syncDebug.entitiesRequested > 0 &&
    syncDebug.entitiesReceived === syncDebug.entitiesRequested;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.subtitle, { color: c.text }]}>Проверка данных</Text>
      <Text style={[typography.caption, styles.row, { color: c.textMuted }]}>
        Подключение: {isConnected ? 'есть' : 'нет'}
      </Text>
      {baseUrl && (
        <Text style={[typography.caption, styles.row, { color: c.textMuted }]}>
          URL: {baseUrl}
        </Text>
      )}
      <Text style={[typography.caption, styles.row, { color: c.textMuted }]}>
        Последняя синхронизация: {formatSyncTime(syncDebug.lastSyncAt)}
      </Text>

      {syncDebug.lastError && (
        <Text style={[typography.body, styles.error, { color: c.warning }]}>
          {syncDebug.lastError}
        </Text>
      )}

      {isConnected && (
        <>
          <Text style={[typography.body, styles.row, { color: hasData ? c.success : c.warning }]}>
            {hasData
              ? `Данные приходят: ${syncDebug.entitiesReceived} из ${syncDebug.entitiesRequested} сущностей`
              : 'Ответ пустой — проверь mapping в ritualsConfig'}
          </Text>

          <Text style={[typography.caption, styles.row, { color: c.textMuted }]}>
            Timeline: {syncDebug.timelineEvents} событий (logbook: {syncDebug.logbookEntries})
          </Text>

          {!allFound && syncDebug.missingEntityIds.length > 0 && (
            <View style={styles.missing}>
              <Text style={[typography.caption, { color: c.warning }]}>
                Не найдены в HA (обнови config):
              </Text>
              {syncDebug.missingEntityIds.map((id) => (
                <Text key={id} style={[typography.caption, { color: c.textMuted, fontFamily: 'monospace' }]}>
                  {id}
                </Text>
              ))}
            </View>
          )}

          {syncDebug.statePreview.length > 0 && (
            <View style={[styles.preview, { backgroundColor: c.background }]}>
              <Text style={[typography.caption, { color: c.textMuted, marginBottom: spacing.xs }]}>
                Состояния (первые {syncDebug.statePreview.length}):
              </Text>
              {syncDebug.statePreview.map((line) => (
                <Text
                  key={line}
                  style={[typography.caption, { color: c.text, fontSize: 11 }]}
                >
                  {line}
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      <CalmButton
        label={isRefreshing ? 'Загружаем…' : 'Обновить данные из HA'}
        variant="secondary"
        onPress={onRefresh}
        isLoading={isRefreshing}
        disabled={!isConnected}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
  },
  row: { marginTop: spacing.xs },
  error: { marginTop: spacing.sm },
  missing: { marginTop: spacing.sm, gap: 2 },
  preview: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
  },
  button: { marginTop: spacing.md },
});
