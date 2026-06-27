# Сценарии Smart Cozy Home — документация для разработчика HA

Этот документ описывает что должен делать каждый сценарий, какие устройства использует, и какие helpers нужны для хранения параметров. Приложение управляет сценариями через эти helpers — scripts и automations трогать не нужно.

---

## Архитектура

Каждый сценарий состоит из двух частей:

**Script** (`script.<id>`) — последовательность действий. Читает параметры из helpers (`input_number`, `input_boolean`), не из hardcode. Приложение вызывает script через `script.turn_on`.

**Automation** (`automation.<id>_schedule`) — только для Вечера, Сна и Утра. Триггер по времени из `input_datetime`, условие — `input_boolean.*_schedule_enabled`. Automation **всегда enabled**; включение/выключение расписания идёт через boolean, не через `automation.turn_on/off`.

Параметры хранятся в HA как helpers — приложение их читает и пишет через REST API.

---

## Устройства (стандартные entity_id)

Все устройства должны быть переименованы под эти entity_id при инсталляции (см. также `DEVICES.md`):

| Entity ID | Устройство |
|---|---|
| `light.bedroom` | Основной свет в спальне |
| `cover.bedroom_curtains` | Шторы |
| `cover.bedroom_window` | Открыватель окна |
| `climate.bedroom_ac` | Кондиционер |
| `climate.bedroom_radiator` | Радиатор |
| `climate.bedroom_ventilation` | Приточная вентиляция |
| `humidifier.bedroom` | Увлажнитель |
| `sensor.bedroom_co2` | Датчик CO₂ |
| `sensor.bedroom_temperature` | Датчик температуры |
| `sensor.bedroom_humidity` | Датчик влажности |

Сценарии отправляют `climate.set_temperature` на все три climate-entity спальни. HA применяет команду только к доступным устройствам; отсутствующие entity игнорируются без ошибки.

---

## Сценарий 1 — Вечер (`script.evening`)

**Что делает:** подготовка ко сну за 30–60 минут до засыпания.

**Действия по порядку:**
1. Плавно снижает яркость света до `input_number.evening_brightness` за 5 минут (`light.turn_on` с `transition: 300`)
2. Закрывает шторы если `input_boolean.evening_curtains = true` (`cover.close_cover`)
3. Устанавливает целевую температуру `input_number.evening_temperature` (`climate.set_temperature`)
4. Включает увлажнитель если `input_boolean.evening_humidifier = true` (`humidifier.turn_on`)
5. Записывает `input_select.home_mode = evening`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.evening_brightness` | number | 15 | 1 | 100 | 1 |
| `input_number.evening_temperature` | number | 18 | 16 | 24 | 0.5 |
| `input_boolean.evening_curtains` | boolean | true | — | — | — |
| `input_boolean.evening_humidifier` | boolean | true | — | — | — |

**Helpers — расписание:**

| Entity | Тип | Дефолт |
|---|---|---|
| `input_boolean.evening_schedule_enabled` | boolean | false |
| `input_datetime.evening_schedule_time` | datetime (has_time: true, has_date: false) | 22:30 |

**Automation:** триггер `platform: time`, `at: input_datetime.evening_schedule_time`, условие `input_boolean.evening_schedule_enabled = true`, действие `script.turn_on: script.evening`.

---

## Сценарий 2 — Сон (`script.sleep`)

**Что делает:** финальное выключение всего перед засыпанием. Обычно запускается через 30–60 минут после «Вечера».

**Действия по порядку:**
1. Выключает свет полностью (`light.turn_off`)
2. Открывает окно если `input_boolean.sleep_window = true` (`cover.open_cover` на `cover.bedroom_window`)
3. Устанавливает ночную температуру `input_number.sleep_temperature` (`climate.set_temperature`)
4. Записывает `input_select.home_mode = sleep`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.sleep_temperature` | number | 17 | 15 | 22 | 0.5 |
| `input_boolean.sleep_window` | boolean | false | — | — | — |

**Helpers — расписание:**

| Entity | Тип | Дефолт |
|---|---|---|
| `input_boolean.sleep_schedule_enabled` | boolean | false |
| `input_datetime.sleep_schedule_time` | datetime (has_time: true, has_date: false) | 23:00 |

**Automation:** аналогично Вечеру.

---

## Сценарий 3 — Утро (`script.morning`)

**Что делает:** мягкое пробуждение — плавно поднимает яркость и открывает шторы.

**Действия по порядку:**
1. Закрывает окно (`cover.close_cover` на `cover.bedroom_window`)
2. Плавно поднимает яркость до `input_number.morning_brightness` за `input_number.morning_warmup_minutes` минут (`light.turn_on` с `transition`)
3. Открывает шторы (`cover.open_cover`)
4. Устанавливает дневную температуру 21° (`climate.set_temperature`, значение фиксированное)
5. Записывает `input_select.home_mode = morning`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.morning_brightness` | number | 80 | 10 | 100 | 1 |
| `input_number.morning_warmup_minutes` | number | 20 | 5 | 60 | 5 |

**Helpers — расписание:**

| Entity | Тип | Дефолт |
|---|---|---|
| `input_boolean.morning_schedule_enabled` | boolean | false |
| `input_datetime.morning_schedule_time` | datetime (has_time: true, has_date: false) | 07:00 |

**Automation:** срабатывает в `morning_schedule_time`. Плавный подъём света начинается в момент запуска script (не за `morning_warmup_minutes` до подъёма).

---

## Сценарий 4 — Уехали (`script.away`)

**Что делает:** переводит дом в режим ожидания при отъезде. Только ручной запуск.

**Действия по порядку:**
1. Выключает весь свет (`light.turn_off` на `light.bedroom`, `light.living_room`)
2. Закрывает шторы если `input_boolean.away_curtains = true` (`cover.close_cover`)
3. Закрывает окно (`cover.close_cover` на `cover.bedroom_window`)
4. Снижает температуру до `input_number.away_temperature` (`climate.set_temperature`)
5. Выключает увлажнитель (`humidifier.turn_off`)
6. Записывает `input_select.home_mode = away`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.away_temperature` | number | 16 | 12 | 20 | 0.5 |
| `input_boolean.away_curtains` | boolean | true | — | — | — |

---

## Сценарий 5 — Еду домой (`script.coming_home`)

**Что делает:** готовит дом к прибытию. Нажимается заранее, дом начинает прогреваться. Только ручной запуск.

**Действия по порядку:**
1. Включает увлажнитель (`humidifier.turn_on`)
2. Устанавливает целевую температуру `input_number.coming_home_temperature` (`climate.set_temperature`)
3. Включает свет на яркость `input_number.coming_home_brightness` с тёплой цветовой температурой (`light.turn_on`)
4. Открывает шторы если на улице день (условие по `sun.sun`: `state = above_horizon`)
5. Записывает `input_boolean.home_ready_for_arrival = true`
6. Записывает `input_select.home_mode = none` (режим нейтральный — дом готовится, не спит)

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.coming_home_minutes` | number | 20 | 5 | 60 | 5 |
| `input_number.coming_home_temperature` | number | 21 | 18 | 25 | 0.5 |
| `input_number.coming_home_brightness` | number | 60 | 10 | 100 | 1 |

> `coming_home_minutes` — параметр для UI (за сколько минут нажать кнопку). Script сам не ждёт — просто применяет настройки немедленно. Таймер на стороне пользователя.

---

## Сценарий 6 — Уют (`script.cozy`)

**Что делает:** расслабленный вечер дома, не для сна. Тёплый мягкий свет, комфортная температура. Только ручной запуск.

**Действия по порядку:**
1. Включает свет на `input_number.cozy_brightness` с максимально тёплой цветовой температурой (`light.turn_on` с `color_temp: 500` mireds)
2. Закрывает шторы (`cover.close_cover`)
3. Устанавливает температуру `input_number.cozy_temperature` (`climate.set_temperature`)
4. Включает увлажнитель (`humidifier.turn_on`)
5. Записывает `input_select.home_mode = cozy`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.cozy_brightness` | number | 40 | 5 | 80 | 5 |
| `input_number.cozy_temperature` | number | 21 | 18 | 24 | 0.5 |

---

## Сценарий 7 — Фокус (`script.focus`)

**Что делает:** режим работы и концентрации. Яркий холодный свет, бодрящая температура. Только ручной запуск.

**Действия по порядку:**
1. Включает свет на `input_number.focus_brightness` с холодной цветовой температурой (`light.turn_on` с `color_temp: 153` mireds)
2. Открывает шторы (`cover.open_cover`) — естественный свет
3. Устанавливает температуру `input_number.focus_temperature` (`climate.set_temperature`)
4. Записывает `input_select.home_mode = focus`

**Helpers — параметры:**

| Entity | Тип | Дефолт | Мин | Макс | Шаг |
|---|---|---|---|---|---|
| `input_number.focus_brightness` | number | 90 | 50 | 100 | 5 |
| `input_number.focus_temperature` | number | 19 | 17 | 22 | 0.5 |

---

## Системные helpers

Нужны для отображения активного сценария в приложении:

| Entity | Тип | Опции / Дефолт |
|---|---|---|
| `input_select.home_mode` | select | none, evening, sleep, morning, away, cozy, focus / дефолт: none |
| `input_boolean.home_ready_for_arrival` | boolean | false |

---

## Что НЕ нужно делать

- Не hardcode параметры в scripts — всё читается из helpers
- Не делать automation enabled/disabled через API — только через `input_boolean.*_schedule_enabled`
- Не создавать отдельные scripts для "выключить всё" — это делает `script.away`
- Не трогать entity_id устройств после инсталляции — приложение завязано на стандартные имена
