# Сценарии Smart Cozy Home — документация для разработчика HA

Этот документ описывает что должен делать каждый сценарий, какие устройства использует, и какие helpers нужны для хранения параметров. Приложение управляет сценариями через эти helpers — scripts и automations трогать не нужно.

---

## Архитектура

Каждый сценарий состоит из двух частей:

**Script** (`script.<id>`) — последовательность действий. Читает параметры из helpers (`input_number`, `input_boolean`), не из hardcode. Приложение вызывает script через `script.turn_on`.

**Automation** (`automation.<id>_schedule`) — для всех сценариев с расписанием. Триггер `time_pattern` каждую минуту; условие — template читает JSON из `input_text.<id>_schedule`. Automation **всегда enabled**; включение/выключение расписания — через поле `enabled` в JSON, не через `automation.turn_on/off`.

Параметры хранятся в HA как helpers — приложение их читает и пишет через REST API.

---

## Устройства (стандартные entity_id)

Все устройства должны быть переименованы под эти entity_id при инсталляции (см. также `DEVICES.md`):

| Entity ID                     | Устройство                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `light.bedroom`               | Основной свет в спальне                                                       |
| `light.bedroom_nightlight`    | Ночник (цвет + яркость; избранные цвета читает приложение из entity registry) |
| `cover.bedroom_curtains`      | Шторы                                                                         |
| `cover.bedroom_window`        | Открыватель окна                                                              |
| `climate.bedroom_ac`          | Кондиционер                                                                   |
| `climate.bedroom_radiator`    | Радиатор                                                                      |
| `climate.bedroom_ventilation` | Приточная вентиляция                                                          |
| `humidifier.bedroom`          | Увлажнитель (умный, основной)                                                 |
| `switch.bedroom_humidifier`   | Увлажнитель через розетку (фолбек)                                            |
| `sensor.bedroom_co2`          | Датчик CO₂                                                                    |
| `sensor.bedroom_temperature`  | Датчик температуры                                                            |
| `sensor.bedroom_humidity`     | Датчик влажности                                                              |
| `sensor.bedroom_pressure`     | Датчик атмосферного давления (mmHg / мм рт. ст.)                              |

Сценарии отправляют `climate.set_temperature` на все три climate-entity спальни. HA применяет команду только к доступным устройствам; отсутствующие entity игнорируются без ошибки.

Увлажнитель: сценарии вызывают `script.bedroom_humidifier_on` / `script.bedroom_humidifier_off` (`humidifier.bedroom`, иначе `switch.bedroom_humidifier`). Подробности — [`DEVICES.md`](./DEVICES.md) § «Увлажнитель».

---

## Сценарий 1 — Вечер (`script.evening`)

**Что делает:** подготовка ко сну за 30–60 минут до засыпания.

**Действия по порядку:**

1. Выключает ночник (`light.turn_off` на `light.bedroom_nightlight`)
2. Плавно снижает яркость основного света до `input_number.evening_brightness` за 5 минут (`light.turn_on` с `transition: 300`)
3. Закрывает шторы если `input_boolean.evening_curtains = true` (`cover.close_cover`)
4. Устанавливает целевую температуру `input_number.evening_temperature` (`climate.set_temperature`)
5. Включает увлажнитель если `input_boolean.evening_humidifier = true` (`humidifier.bedroom` или фолбек `switch.bedroom_humidifier`)
6. Записывает `input_select.home_mode = evening`

**Helpers — параметры:**

| Entity                             | Тип     | Дефолт | Мин | Макс | Шаг |
| ---------------------------------- | ------- | ------ | --- | ---- | --- |
| `input_number.evening_brightness`  | number  | 15     | 1   | 100  | 1   |
| `input_number.evening_temperature` | number  | 18     | 16  | 24   | 0.5 |
| `input_boolean.evening_curtains`   | boolean | true   | —   | —    | —   |
| `input_boolean.evening_humidifier` | boolean | true   | —   | —    | —   |

**Helpers — расписание:**

| Entity                        | Тип            | Дефолт                    |
| ----------------------------- | -------------- | ------------------------- |
| `input_text.evening_schedule` | text (JSON v1) | все дни выкл, время 22:30 |

**Automation:** `automation.evening_schedule` — template сравнивает текущий день недели и время с JSON, действие `script.turn_on: script.evening`.

---

## Сценарий 2 — Сон (`script.sleep`)

**Что делает:** финальное выключение всего перед засыпанием. Обычно запускается через 30–60 минут после «Вечера».

**Действия по порядку:**

1. Выключает основной свет (`light.turn_off` на `light.bedroom`)
2. Если `input_boolean.sleep_nightlight = true` — включает ночник на `input_number.sleep_nightlight_brightness` **без смены цвета** (`light.turn_on` только с `brightness_pct`); иначе выключает ночник
3. Открывает окно если `input_boolean.sleep_window = true` (`cover.open_cover` на `cover.bedroom_window`)
4. Устанавливает ночную температуру `input_number.sleep_temperature` (`climate.set_temperature`)
5. Записывает `input_select.home_mode = sleep`

**Helpers — параметры:**

| Entity                                     | Тип     | Дефолт | Мин | Макс | Шаг |
| ------------------------------------------ | ------- | ------ | --- | ---- | --- |
| `input_number.sleep_temperature`           | number  | 17     | 15  | 22   | 0.5 |
| `input_boolean.sleep_window`               | boolean | false  | —   | —    | —   |
| `input_boolean.sleep_nightlight`           | boolean | true   | —   | —    | —   |
| `input_number.sleep_nightlight_brightness` | number  | 8      | 1   | 30   | 1   |

**Helpers — расписание:**

| Entity                      | Тип            | Дефолт                    |
| --------------------------- | -------------- | ------------------------- |
| `input_text.sleep_schedule` | text (JSON v1) | все дни выкл, время 23:00 |

**Automation расписания:** аналогично Вечеру (`automation.sleep_schedule`).

**Runtime loop (качество воздуха):** `automation.sleep_air_quality` — работает пока `home_mode = sleep`, `sleep_window = on`, `binary_sensor.bedroom_occupancy = on`:

| CO₂       | Действия                                                           |
| --------- | ------------------------------------------------------------------ |
| ≥ 900 ppm | Открыть окно, выключить увлажнитель и AC                           |
| ≤ 750 ppm | Закрыть окно, включить увлажнитель, setpoint sleep temp на climate |

Пороги sync with `apps/mobile/src/domain/sleepAirQuality.const.ts`.

`script.sleep` задаёт **начальное** состояние (основной свет off, опционально ночник только с яркостью, опционально окно, setpoint, `home_mode = sleep`). Цикл CO₂ выполняет automation, не приложение.

`automation.ac_off_when_window_open` — AC выключается при любом открытии окна.

**Уличная температура:** `weather.forecast_home_assistant` (`attributes.temperature`) — для UI и физики mock.

---

## Сценарий 3 — Утро (`script.morning`)

**Что делает:** мягкое пробуждение — плавно поднимает яркость и открывает шторы.

**Действия по порядку:**

1. Выключает ночник (`light.turn_off` на `light.bedroom_nightlight`)
2. Закрывает окно (`cover.close_cover` на `cover.bedroom_window`)
3. Плавно поднимает яркость до `input_number.morning_brightness` за `input_number.morning_warmup_minutes` минут (`light.turn_on` с `transition`)
4. Открывает шторы (`cover.open_cover`)
5. Устанавливает дневную температуру 21° (`climate.set_temperature`, значение фиксированное)
6. Записывает `input_select.home_mode = morning`

**Helpers — параметры:**

| Entity                                | Тип    | Дефолт | Мин | Макс | Шаг |
| ------------------------------------- | ------ | ------ | --- | ---- | --- |
| `input_number.morning_brightness`     | number | 80     | 10  | 100  | 1   |
| `input_number.morning_warmup_minutes` | number | 20     | 5   | 60   | 5   |

**Helpers — расписание:**

| Entity                        | Тип            | Дефолт                    |
| ----------------------------- | -------------- | ------------------------- |
| `input_text.morning_schedule` | text (JSON v1) | все дни выкл, время 07:00 |

**Automation:** срабатывает по JSON-расписанию. Плавный подъём света начинается в момент запуска script (не за `morning_warmup_minutes` до подъёма).

---

## Сценарий 4 — Уехали (`script.away`)

**Что делает:** переводит дом в режим ожидания при отъезде. Только ручной запуск.

**Действия по порядку:**

1. Выключает весь свет (`light.turn_off` на `light.bedroom`, `light.living_room`, `light.bedroom_nightlight`)
2. Закрывает шторы если `input_boolean.away_curtains = true` (`cover.close_cover`)
3. Закрывает окно (`cover.close_cover` на `cover.bedroom_window`)
4. Снижает температуру до `input_number.away_temperature` (`climate.set_temperature`)
5. Выключает увлажнитель (`humidifier.bedroom` или фолбек `switch.bedroom_humidifier`)
6. Сбрасывает `input_boolean.home_ready_for_arrival = false`
7. Записывает `input_select.home_mode = away`

**Helpers — параметры:**

| Entity                          | Тип     | Дефолт | Мин | Макс | Шаг |
| ------------------------------- | ------- | ------ | --- | ---- | --- |
| `input_number.away_temperature` | number  | 16     | 12  | 20   | 0.5 |
| `input_boolean.away_curtains`   | boolean | true   | —   | —    | —   |

---

## Сценарий 5 — Еду домой (`script.coming_home`)

**Что делает:** готовит дом к прибытию. Нажимается заранее, дом начинает прогреваться. Только ручной запуск.

**Действия по порядку:**

1. Выключает ночник (`light.turn_off` на `light.bedroom_nightlight`)
2. Включает увлажнитель (`humidifier.bedroom` или фолбек `switch.bedroom_humidifier`)
3. Устанавливает целевую температуру `input_number.coming_home_temperature` (`climate.set_temperature`)
4. Включает свет на яркость `input_number.coming_home_brightness` с тёплой цветовой температурой (`light.turn_on`)
5. Открывает шторы если на улице день (условие по `sun.sun`: `state = above_horizon`)
6. Записывает `input_boolean.home_ready_for_arrival = true`
7. Записывает `input_select.home_mode = none` (режим нейтральный — дом готовится, не спит)

**Helpers — параметры:**

| Entity                                 | Тип    | Дефолт | Мин | Макс | Шаг |
| -------------------------------------- | ------ | ------ | --- | ---- | --- |
| `input_number.coming_home_minutes`     | number | 20     | 5   | 60   | 5   |
| `input_number.coming_home_temperature` | number | 21     | 18  | 25   | 0.5 |
| `input_number.coming_home_brightness`  | number | 60     | 10  | 100  | 1   |

> `coming_home_minutes` — параметр для UI (за сколько минут нажать кнопку). Script сам не ждёт — просто применяет настройки немедленно. Таймер на стороне пользователя.

---

## Сценарий 6 — Уют (`script.cozy`)

**Что делает:** расслабленный вечер дома, не для сна. Тёплый мягкий свет, комфортная температура. Только ручной запуск.

**Действия по порядку:**

1. Выключает ночник (`light.turn_off` на `light.bedroom_nightlight`)
2. Включает свет на `input_number.cozy_brightness` с максимально тёплой цветовой температурой (`light.turn_on` с `color_temp: 500` mireds)
3. Закрывает шторы (`cover.close_cover`)
4. Устанавливает температуру `input_number.cozy_temperature` (`climate.set_temperature`)
5. Включает увлажнитель (`humidifier.bedroom` или фолбек `switch.bedroom_humidifier`)
6. Записывает `input_select.home_mode = cozy`

**Helpers — параметры:**

| Entity                          | Тип    | Дефолт | Мин | Макс | Шаг |
| ------------------------------- | ------ | ------ | --- | ---- | --- |
| `input_number.cozy_brightness`  | number | 40     | 5   | 80   | 5   |
| `input_number.cozy_temperature` | number | 21     | 18  | 24   | 0.5 |

---

## Сценарий 7 — Фокус (`script.focus`)

**Что делает:** режим работы и концентрации. Яркий холодный свет, бодрящая температура. Только ручной запуск.

**Действия по порядку:**

1. Выключает ночник (`light.turn_off` на `light.bedroom_nightlight`)
2. Включает свет на `input_number.focus_brightness` с холодной цветовой температурой (`light.turn_on` с `color_temp: 153` mireds)
3. Открывает шторы (`cover.open_cover`) — естественный свет
4. Устанавливает температуру `input_number.focus_temperature` (`climate.set_temperature`)
5. Записывает `input_select.home_mode = focus`

**Helpers — параметры:**

| Entity                           | Тип    | Дефолт | Мин | Макс | Шаг |
| -------------------------------- | ------ | ------ | --- | ---- | --- |
| `input_number.focus_brightness`  | number | 90     | 50  | 100  | 5   |
| `input_number.focus_temperature` | number | 19     | 17  | 22   | 0.5 |

---

## Системные helpers

Нужны для отображения активного сценария в приложении:

| Entity                                 | Тип     | Опции / Дефолт                                                  |
| -------------------------------------- | ------- | --------------------------------------------------------------- |
| `input_select.home_mode`               | select  | none, evening, sleep, morning, away, cozy, focus / дефолт: none |
| `input_boolean.home_ready_for_arrival` | boolean | false                                                           |

`home_ready_for_arrival` включает `script.coming_home`, сбрасывает `script.away`. Пока дом в режиме отъезда, карточка «Еду домой» не показывает prepared.

---

## Что НЕ нужно делать

- Не hardcode параметры в scripts — всё читается из helpers
- Не делать automation enabled/disabled через API — расписание управляется JSON в `input_text.*_schedule`
- Не создавать отдельные scripts для "выключить всё" — это делает `script.away`
- Не трогать entity_id устройств после инсталляции — приложение завязано на стандартные имена
