import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import type { TBedroomSlotUiState } from '@/features/settings/lib/bedroomSensorSlotState';

export interface IBedroomSensorControlsCardProps {
  /** Слот датчика */
  slot: TBedroomSensorSlot;
  /** Подпись в UI */
  label: string;
  /** Отформатированное значение или статус */
  valueLabel: string;
  /** Состояние слота в настройках */
  uiState: TBedroomSlotUiState;
  /** Открыть выбор датчика в HA */
  onConfigure: () => void;
}
