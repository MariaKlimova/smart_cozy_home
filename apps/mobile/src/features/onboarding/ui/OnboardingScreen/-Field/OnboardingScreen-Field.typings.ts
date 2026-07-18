import type { Ref } from 'react';
import type { TextInput } from 'react-native';

export interface IOnboardingScreenFieldProps {
  /** Подпись поля */
  label: string;
  /** Значение */
  value: string;
  /** Изменение значения */
  onChangeText: (value: string) => void;
  /** Скрытый ввод (токен) */
  secure?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Колбэк при фокусе поля */
  onFocus?: () => void;
  /** Тип клавиатуры */
  keyboardType?: 'default' | 'url';
  /** Автокапитализация */
  autoCapitalize?: 'none' | 'sentences';
  /** Тип контента для автозаполнения */
  textContentType?: 'password' | 'none';
  /** Автозаполнение */
  autoComplete?: 'off' | 'password';
  /** Ref на TextInput */
  inputRef?: Ref<TextInput>;
}
