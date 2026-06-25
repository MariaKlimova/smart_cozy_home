import type { StyleProp, ViewStyle } from 'react-native';

/** Опция segmented-контрола */
export interface ICalmSegmentedOption {
  /** id опции */
  id: string;
  /** Подпись */
  label: string;
}

export interface ICalmSegmentedProps {
  /** Варианты выбора */
  options: ICalmSegmentedOption[];
  /** id активной опции */
  value: string;
  /** Выбор опции */
  onValueChange: (optionId: string) => void;
  /** Неактивен */
  disabled?: boolean;
  /** Дополнительные стили обёртки */
  style?: StyleProp<ViewStyle>;
}
