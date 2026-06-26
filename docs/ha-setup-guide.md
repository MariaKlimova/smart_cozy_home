# Настройка Home Assistant

## Скрипты сценариев

Создайте в HA scripts с id, совпадающими с mapping:

| Сценарий в приложении | script_id | home_mode option |
|-----------------------|-----------|------------------|
| Вечер | `ritual_evening` | `evening` |
| Сон | `ritual_sleep` | `sleep` |
| Утро | `ritual_morning` | `morning` |
| Уехали | `ritual_away` | `away` |
| Еду домой | `ritual_coming_home` | — |
| Уют | `ritual_cozy` | `cozy` |
| Фокус | `ritual_focus` | `focus` |

### Режимы (mode)

Скрипт режима должен выставить `input_select.home_mode` в соответствующий option (например `evening`). Приложение показывает карточку как **активную** до выхода.

Повторный тап по активной карточке выставляет `home_mode` в `none` (см. `scenarios_ha.exit_home_mode_option` в `config/home.default.yaml`).

### Подготовка (Еду домой)

Скрипт `ritual_coming_home` должен включить helper `input_boolean.home_ready_for_arrival`. Карточка переходит в состояние **«Дом готов к тебе»**. Повторный тап перезапускает подготовку.

Prepared снимается, когда кто-то приходит домой (person → home), включается другой режим или boolean выключается в HA.

## Helpers

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

Обновите entity id в `config/home.default.yaml` → `scenarios_ha`, если имена отличаются.

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
