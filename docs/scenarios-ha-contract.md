# Контракт HA для сценариев

Описание entity_id и поведения, на которое опираются приложение (SH-14, SH-15) и инсталляционный пакет (SH-24).

## Два слоя

| Слой | Кто | Что |
|------|-----|-----|
| **Инсталляция** | Разработчик / инсталлятор, один раз | Пакет `packages/ha-installer/` (SH-24): helpers, scripts, automations |
| **Эксплуатация** | Пользователь в приложении | Запуск `script.*`; настройка параметров и расписания через REST к helpers |

Приложение **не пишет YAML** в HA. URL + long-lived token достаточно для чтения states и вызова services.

## Scripts

| id | entity_id |
|----|-----------|
| evening | `script.evening` |
| sleep | `script.sleep` |
| morning | `script.morning` |
| away | `script.away` |
| coming_home | `script.coming_home` |
| cozy | `script.cozy` |
| focus | `script.focus` |

Конфиг приложения: `apps/mobile/src/features/scenarios/config/scenarios.ts`, `config/home.default.yaml`.

## Системные helpers (состояние карточек)

| Entity | Назначение |
|--------|------------|
| `input_select.home_mode` | Активный режим: `none`, `evening`, `sleep`, `morning`, `away`, `cozy`, `focus` |
| `input_boolean.home_ready_for_arrival` | Подготовка «Еду домой» (`prepared` в UI) |

Поведение scripts:

- Режимы (`evening` … `focus`, кроме `coming_home`) после выполнения выставляют `home_mode` в свой option.
- `script.coming_home` включает `home_ready_for_arrival` и выставляет `home_mode = none`.
- Повторный тап по active-режиму в приложении → `home_mode = none`.

## Расписание (Вечер, Сон, Утро)

Приложение **не редактирует** automation напрямую. Automation читает helpers:

| Entity | UI в SH-15 |
|--------|------------|
| `input_boolean.evening_schedule_enabled` | Toggle «По расписанию» |
| `input_datetime.evening_schedule_time` | Time picker |
| `input_boolean.sleep_schedule_enabled` | … |
| `input_datetime.sleep_schedule_time` | … |
| `input_boolean.morning_schedule_enabled` | … |
| `input_datetime.morning_schedule_time` | … |

Automation `automation.{id}_schedule`: trigger по `input_datetime`, condition на `input_boolean`, action → `script.{id}`.

## Параметры сценариев (input_number / input_boolean)

Источник правды для значений — HA. Приложение читает state и пишет через `input_number.set_value`, `input_boolean.turn_on/off`.

| Сценарий | Helpers |
|----------|---------|
| **evening** | `input_number.evening_brightness` (15), `input_number.evening_temperature` (18), `input_boolean.evening_curtains` (true), `input_boolean.evening_humidifier` (true) |
| **sleep** | `input_number.sleep_temperature` (17), `input_boolean.sleep_window` (false) |
| **morning** | `input_number.morning_brightness` (80), `input_number.morning_warmup_minutes` (20) |
| **away** | `input_number.away_temperature` (16), `input_boolean.away_curtains` (true) |
| **coming_home** | `input_number.coming_home_minutes` (20), `input_number.coming_home_temperature` (21), `input_number.coming_home_brightness` (60) |
| **cozy** | `input_number.cozy_brightness` (40), `input_number.cozy_temperature` (21) |
| **focus** | `input_number.focus_brightness` (90), `input_number.focus_temperature` (19) |

Scripts читают эти значения в runtime, не hardcode.

## Устройства (справочник для инсталлятора)

Файл `DEVICES.md` в пакете — **не создаёт** устройства в HA. Инсталлятор переименовывает / маппит реальные entities под ожидаемые id (см. `homeConfig.ts`):

**Спальня:** `light.bedroom`, `cover.bedroom_curtains`, `cover.bedroom_window`, `climate.bedroom_ac`, `climate.bedroom_ventilation`, `climate.bedroom_radiator`, `humidifier.bedroom`, `sensor.bedroom_co2`, `sensor.bedroom_temperature`, `sensor.bedroom_humidity`

**Дом:** `light.living_room`, `climate.living_room`, `sensor.living_room_temperature`, `alarm_control_panel.home`

## Связанные задачи

- **SH-14** — карточки, запуск, active/prepared
- **SH-15** — экран настроек (параметры + расписание → helpers)
- **SH-24** — инсталляционный пакет YAML
- **SH-21** — sync `home.default.yaml` ↔ `homeConfig.ts`
