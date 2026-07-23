# Настройка Home Assistant

## Быстрый путь (рекомендуется)

Установите инсталляционный пакет (`packages/ha-installer/` в git → `/config/packages/ha-installer/` на HA). Он создаёт helpers, scripts и automations с entity_id, которые ожидает приложение.

Пошагово: [`packages/ha-installer/INSTALL.md`](../packages/ha-installer/INSTALL.md) — только **File editor**, без Samba.

Полный контракт entity_id: [scenarios-ha-contract.md](./scenarios-ha-contract.md).

После установки пакета:

1. Переименуйте / привяжите устройства под стандартные id (см. `DEVICES.md` в пакете).
2. В приложении: onboarding → URL + токен (моки выкл: не задавать `EXPO_PUBLIC_USE_HA_MOCKS=true`).
3. Проверьте сценарии вручную и расписание через экран настроек сценария.
4. При необходимости: Спальня → «Свет виден с» (`input_number.bedroom_light_visible_min`).

## Роль приложения

| Действие | Как |
|----------|-----|
| Запуск сценария | `script.turn_on` (`script.evening`, …) |
| Выход из режима | `script.exit_home_mode` (`home_mode = none` + `script.turn_off` режимов + стоп музыки) |
| Active / prepared | Чтение `input_select.home_mode`, `input_boolean.home_ready_for_arrival` |
| Параметры (яркость, температура, …) | Запись в `input_number.*` / `input_boolean.*` |
| Калибровка яркости света | `input_number.bedroom_light_visible_min` |
| Расписание | Запись в `input_text.{id}_schedule` (компактный JSON v1) |

Scripts и automations в HA **не редактируются** из приложения.

## Ручная настройка (без пакета SH-24)

Если пакет ещё не установлен, минимум для работы карточек active/prepared:

### Helpers

```yaml
input_select:
  home_mode:
    name: Режим дома
    options:
      - none
      - evening
      - sleep
      - morning
      - away
      - cozy
      - focus

input_boolean:
  home_ready_for_arrival:
    name: Дом готов к приезду
```

### Scripts

Создайте scripts с id из [контракта](./scenarios-ha-contract.md). Каждый script режима должен выставить `input_select.home_mode`; `script.coming_home` — включить `home_ready_for_arrival` и сбросить `home_mode` в `none`.

## Комнаты и mapping

- Назначьте устройствам **Areas** в HA.
- Обновите `config/home.default.yaml` → секции `rooms`, `bedroom_devices`.

## Токен доступа

1. Профиль → Long-Lived Access Tokens → Create Token.
2. Введите URL и токен в onboarding приложения.

## Локально и удалённо

- **LAN:** `http://192.168.x.x:8123`
- **Удалённо:** Nabu Casa URL или reverse proxy с HTTPS.
