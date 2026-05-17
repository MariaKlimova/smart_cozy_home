export const copy = {
  home: {
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
  rooms: {
    sectionTitle: 'Комнаты',
    lightOn: 'Свет включён',
    lightOff: 'Свет выключен',
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
    syncTitle: 'Проверка данных',
    syncRefresh: 'Обновить данные из HA',
  },
  onboarding: {
    title: 'Подключи дом',
    subtitle: 'Home Assistant остаётся за кадром — ты видишь только уют.',
    name: 'Название',
    localUrl: 'Локальный URL (LAN)',
    remoteUrl: 'Удалённый URL (опционально)',
    token: 'Access token',
    save: 'Сохранить',
  },
  notFound: {
    screenTitle: 'Страница не найдена',
    title: 'Такой страницы нет',
    link: 'На главную',
  },
  haEntities: {
    hint: 'Скопируй идентификатор устройства в config — ищи свет, датчики, людей',
  },
} as const;
