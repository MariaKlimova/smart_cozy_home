/**
 * Нейтральное представление цвета света (без ключей HA API).
 * Конвертация в/из `rgb_color` / `hs_color` только в `src/ha/`.
 */
export type TLightColorValue =
  | {
      /** Режим RGB */
      kind: 'rgb';
      /** Красный, зелёный, синий 0–255 */
      rgb: [number, number, number];
    }
  | {
      /** Режим HS */
      kind: 'hs';
      /** Оттенок 0–360 */
      hue: number;
      /** Насыщенность 0–100 */
      saturation: number;
    }
  | {
      /** Цветовая температура в Кельвинах */
      kind: 'color_temp_kelvin';
      /** Температура, K */
      kelvin: number;
    }
  | {
      /** Режим RGBW */
      kind: 'rgbw';
      /** R, G, B, W */
      rgbw: [number, number, number, number];
    }
  | {
      /** Режим RGBWW */
      kind: 'rgbww';
      /** R, G, B, cold white, warm white */
      rgbww: [number, number, number, number, number];
    };
