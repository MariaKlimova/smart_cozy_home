export interface IAdjustSheetProps {
  /** Видимость sheet */
  visible: boolean;
  /** Закрыть sheet */
  onClose: () => void;
  /** Показать toast при ошибке команды устройства */
  onManualControlError: () => void;
}
