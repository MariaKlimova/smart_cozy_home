export const copy = {
  home: {
    screenTitle: 'Дом',
    defaultTitle: 'Дом в порядке',
    awayTitle: 'Дом ждёт тебя',
    guestsTitle: 'Гости у нас',
  },
  connection: {
    offline: 'Дом сейчас недоступен. Проверь сеть или URL.',
    checking: 'Связываемся с домом…',
    needUrl: 'Укажи хотя бы локальный или удалённый URL Home Assistant.',
  },
  rituals: {
    sectionTitle: 'Ритуалы',
    running: 'Запускаем…',
  },
  notifications: {
    dismissLater: 'Не сейчас',
  },
  rooms: {
    sectionTitle: 'Комнаты',
    lightOn: 'Свет включён',
    lightOff: 'Свет выключен',
    lightOnA11y: 'Включить свет',
    lightOffA11y: 'Выключить свет',
  },
  presence: {
    sectionTitle: 'Кто дома',
    empty: 'Никого дома',
  },
  timeline: {
    sectionTitle: 'День дома',
    empty: 'Пока тихо — событий нет',
  },
  settings: {
    screenTitle: 'Настройки',
    syncTitle: 'Проверка данных',
    syncRefresh: 'Обновить данные',
    syncRefreshing: 'Загружаем…',
    haDevicesList: 'Список устройств',
    reconnect: 'Изменить подключение к дому',
  },
  onboarding: {
    title: 'Подключи дом',
    subtitle: 'Home Assistant остаётся за кадром — ты видишь только уют.',
    remoteOnlyHint:
      'Только удалённый URL? Оставь локальный пустым — подключимся сразу к Nabu Casa.',
    name: 'Название',
    localUrl: 'Локальный URL (LAN)',
    remoteUrl: 'Удалённый URL (опционально)',
    token: 'Токен доступа',
    localUrlPlaceholder: 'http://192.168.x.x:8123 (опционально)',
    remoteUrlPlaceholder: 'https://….ui.nabu.casa',
    save: 'Сохранить',
  },
  notFound: {
    screenTitle: 'Страница не найдена',
    title: 'Такой страницы нет',
    link: 'На главную',
  },
  haEntities: {
    screenTitle: 'Список устройств',
    hint: 'Скопируй идентификатор устройства в config — ищи свет, датчики, людей',
    searchPlaceholder: 'Поиск: свет, датчик, кухня…',
    loading: 'Загрузка…',
    shownCount: 'Показано: {shown} из {total}',
    emptySearch: 'Ничего не найдено',
    emptyList: 'Список пуст',
  },
} as const;
