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
- `script.away` сбрасывает `home_ready_for_arrival` — подготовка к приезду актуальна только пока дом не в режиме отъезда.
- Повторный тап по active-режиму в приложении → `home_mode = none`.

## Расписание (все сценарии)

Приложение **не редактирует** automation напрямую. Недельное расписание хранится в `input_text.{id}_schedule` (JSON v1).

| UI | HA entity |
|----|-----------|
| Мастер-toggle «По расписанию» + дни Пн–Вс | `input_text.{id}_schedule` |

JSON-схема (v1):

```json
{
  "version": 1,
  "enabled": true,
  "weekdays": {
    "mon": { "enabled": true, "time": "07:00" },
    "sat": { "enabled": true, "time": "08:00" }
  }
}
```

Automation `automation.{id}_schedule`: trigger `time_pattern` каждую минуту, condition — template читает JSON.

Подпись на карточке: ближайший включённый день и время («Сегодня в 07:00», «Ср в 08:00»).

## Automations runtime (Сон)

Помимо расписания, пакет создаёт automations для цикла качества воздуха в режиме сна:

| Entity | Назначение |
|--------|------------|
| `automation.sleep_air_quality` | CO₂ hysteresis 900/750 ppm: окно ↔ увлажнитель, AC off при проветривании |
| `automation.ac_off_when_window_open` | `climate.bedroom_ac` off при открытом окне |

Условия `sleep_air_quality`: `home_mode = sleep`, `sleep_window = on`, `binary_sensor.bedroom_occupancy = on`.

Пороги CO₂ sync with `apps/mobile/src/domain/sleepAirQuality.const.ts` (900 / 750).

`script.sleep` — только начальное состояние; loop выполняет automation.

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

**Спальня:** `light.bedroom`, `cover.bedroom_curtains`, `cover.bedroom_window`, `climate.bedroom_ac`, `climate.bedroom_ventilation`, `climate.bedroom_radiator`, `humidifier.bedroom`, `sensor.bedroom_co2`, `sensor.bedroom_temperature`, `sensor.bedroom_humidity`, `binary_sensor.bedroom_occupancy`

**Дом:** `light.living_room`, `climate.living_room`, `sensor.living_room_temperature`, `weather.forecast_home_assistant`, `sun.sun`, `alarm_control_panel.home`

## Внешние условия (таб «Сейчас»)

Блок «Снаружи» на экране «Сейчас» читает два entity (контракт: `HA_ENTITIES.devices.outdoorTemperature`, `HA_ENTITIES.system.sun` в `scenarioHaMapping.ts`).

| Entity | Что читает приложение | UI |
|--------|------------------------|-----|
| `weather.forecast_home_assistant` | `attributes.temperature` — температура, °C (`state` — условие погоды) | Чип «Температура» |
| `sun.sun` | `attributes.next_rising`, `attributes.next_setting` (ISO datetime) | Время + подпись «Закат» / «Восход» |

**`sun.sun`** — встроенная entity Home Assistant (маппинг не нужен). Атрибуты `next_rising` / `next_setting` всегда указывают на **следующие** восход и закат.

Логика UI (не зависит от `state` entity):

1. Из обоих атрибутов берутся только моменты **в будущем** относительно текущего времени устройства.
2. Выбирается ближайший: если это `next_setting` → время + подпись «Закат», если `next_rising` → «Восход».

Реализация: `apps/mobile/src/features/now/lib/parseSunEvent.ts`.

В scripts пакета `sun.sun` используется отдельно: `state = above_horizon` в `script.coming_home` (шторы днём).

## Связанные задачи

- **SH-14** — карточки, запуск, active/prepared
- **SH-15** — экран настроек (параметры + расписание → helpers)
- **SH-24** — инсталляционный пакет YAML
- **SH-21** — sync `home.default.yaml` ↔ `homeConfig.ts`
