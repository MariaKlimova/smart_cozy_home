import { View } from 'react-native';

import { CalmSheet } from '@/ui/CalmSheet';

import { SleepNightDetailScoreMethodSheetConsistencyBody } from './-ConsistencyBody';
import { SleepNightDetailScoreMethodSheetDurationBody } from './-DurationBody';
import { SLEEP_NIGHT_DETAIL_SCORE_METHOD_SHEET } from './SleepNightDetail-ScoreMethodSheet.const';
import type { ISleepNightDetailScoreMethodSheetProps } from './SleepNightDetail-ScoreMethodSheet.typings';
import { styles } from './SleepNightDetail-ScoreMethodSheet.styles';

export function SleepNightDetailScoreMethodSheet({
  visible,
  component,
  methodDetails,
  onClose,
}: ISleepNightDetailScoreMethodSheetProps) {
  return (
    <CalmSheet visible={visible} title="" onClose={onClose}>
      <View style={styles.content} testID={SLEEP_NIGHT_DETAIL_SCORE_METHOD_SHEET}>
        {methodDetails && component === 'duration' ? (
          <SleepNightDetailScoreMethodSheetDurationBody methodDetails={methodDetails} />
        ) : null}
        {methodDetails && component === 'consistency' ? (
          <SleepNightDetailScoreMethodSheetConsistencyBody methodDetails={methodDetails} />
        ) : null}
      </View>
    </CalmSheet>
  );
}
