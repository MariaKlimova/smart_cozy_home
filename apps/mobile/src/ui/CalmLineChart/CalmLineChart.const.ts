export const CALM_LINE_CHART = 'CalmLineChart' as const;

/** Высота области графика по умолчанию, px */
export const CALM_LINE_CHART_DEFAULT_HEIGHT = 200;

/** Отступы графика, px */
export const CALM_LINE_CHART_PADDING = {
  top: 12,
  right: 16,
  bottom: 28,
  left: 44,
} as const;

/** Скругление области построения, px */
export const CALM_LINE_CHART_PLOT_RADIUS = 12;

/** Минимальное число точек для отрисовки линии */
export const CALM_LINE_CHART_MIN_POINTS = 1;

/** Толщина линии данных, px */
export const CALM_LINE_CHART_LINE_WIDTH = 2.5;

/** Радиус маркера точки, px */
export const CALM_LINE_CHART_DOT_RADIUS = 3.5;

/** Прозрачность базового фона области построения */
export const CALM_LINE_CHART_PLOT_BG_OPACITY = 0.55;

/** Прозрачность зоны нормы */
export const CALM_LINE_CHART_NORM_OPACITY = 0.28;

/** Прозрачность зоны вне нормы */
export const CALM_LINE_CHART_OUT_OF_NORM_OPACITY = 0.14;

/** Размер подписи осей графика, px */
export const CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE = 11;

/** Смещение подписи оси X от нижнего края SVG, px */
export const CALM_LINE_CHART_X_LABEL_BOTTOM_OFFSET = 6;

/** Идентификатор clipPath области построения */
export const CALM_LINE_CHART_PLOT_CLIP_ID = 'calmLineChartPlotClip';
