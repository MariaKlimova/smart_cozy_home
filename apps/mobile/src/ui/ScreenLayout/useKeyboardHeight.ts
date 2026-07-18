import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Высота клавиатуры (0, если скрыта).
 * На iOS слушаем will* — синхронно с анимацией; на Android — did*.
 */
export function useKeyboardHeight(enabled: boolean): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [enabled]);

  return height;
}
