/** Пропсы блока */
export interface IOnboardingScreenProps {
  /**
   * Режим изменения существующего подключения (из настроек).
   * Показывает stack-header с «назад» и предзаполняет поля из профиля.
   */
  isEditing?: boolean;
  /** Зарезервировано для тестов */
  testID?: string;
}
