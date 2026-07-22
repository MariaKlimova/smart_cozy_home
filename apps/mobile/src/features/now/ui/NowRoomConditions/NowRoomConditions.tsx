import { copy } from '@/copy/ru';
import { useBedroomHistory24h } from '@/features/now/lib/useBedroomHistory24h';
import { RoomConditionsChart } from '@/ui/RoomConditionsChart';

import type { INowRoomConditionsProps } from './NowRoomConditions.typings';

/** График условий в комнате за 24 часа на экране «Сейчас» */
export function NowRoomConditions({ enabled }: INowRoomConditionsProps) {
  const { samples, startAt, endAt, isLoading, isFetching, isError, hasSensors } =
    useBedroomHistory24h({
      enabled,
    });

  if (!enabled || !hasSensors) {
    return null;
  }

  const showSkeleton = isLoading || (isFetching && samples.length === 0 && !isError);

  let emptyMessage: string = copy.now.roomConditionsEmpty;
  if (isError) {
    emptyMessage = copy.now.roomConditionsError;
  }

  return (
    <RoomConditionsChart
      samples={isError ? [] : samples}
      range={{ startAt, endAt }}
      title={copy.sleep.roomConditionsTitle}
      subtitle={copy.now.roomConditionsPeriod}
      emptyMessage={emptyMessage}
      isLoading={showSkeleton}
      showNormBand={false}
    />
  );
}
