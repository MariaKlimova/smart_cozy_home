# Настройка Home Assistant

## Скрипты / сцены ритуалов

Создайте в HA scripts или scenes с id, совпадающими с mapping:

| Ритуал в приложении | Рекомендуемый script_id |
|---------------------|-------------------------|
| Вечер | `ritual_evening` |
| Сон | `ritual_sleep` |
| Фокус | `ritual_focus` |
| Уют | `ritual_cozy` |
| Уехали | `ritual_away` |

## Helpers (опционально)

- `input_select.home_mode` — синхронизация активного ритуала с HA.

## Комнаты

- Назначьте устройствам **Areas** в HA.
- Обновите `config/home.default.yaml` → секция `rooms`.

## Presence

- Настройте **Person** entities.
- Укажите их в `config/home.default.yaml` → `presence.persons`.

## Токен доступа

1. Профиль → Long-Lived Access Tokens → Create Token.
2. Введите URL и токен в onboarding приложения.

## Локально и удалённо

- **LAN:** `http://192.168.x.x:8123`
- **Удалённо:** Nabu Casa URL или reverse proxy с HTTPS.
