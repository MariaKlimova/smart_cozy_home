import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { CalmButton } from '@/ui/CalmButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { DATA_SYNC_PREVIEW_FONT_SIZE } from './DataSyncStatus.const';
import type { IDataSyncStatusProps } from './DataSyncStatus.typings';
import { styles } from './DataSyncStatus.styles';

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
      <Text style={[typography.subtitle, { color: c.text }]}>{copy.settings.syncTitle}</Text>
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
                <Text
                  key={id}
                  style={[typography.caption, styles.mono, { color: c.textMuted }]}
                >
                  {id}
                </Text>
              ))}
            </View>
          )}

          {syncDebug.statePreview.length > 0 && (
            <View style={[styles.preview, { backgroundColor: c.background }]}>
              <Text
                style={[
                  typography.caption,
                  styles.previewCaption,
                  { color: c.textMuted },
                ]}
              >
                Состояния (первые {syncDebug.statePreview.length}):
              </Text>
              {syncDebug.statePreview.map((line) => (
                <Text
                  key={line}
                  style={[
                    typography.caption,
                    { color: c.text, fontSize: DATA_SYNC_PREVIEW_FONT_SIZE },
                  ]}
                >
                  {line}
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      <CalmButton
        label={isRefreshing ? copy.settings.syncRefreshing : copy.settings.syncRefresh}
        variant="secondary"
        onPress={onRefresh}
        isLoading={isRefreshing}
        disabled={!isConnected}
        style={styles.button}
      />
    </View>
  );
}
