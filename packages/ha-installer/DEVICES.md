# Справочник entity_id для инсталлятора

Этот файл **не создаёт** устройства в Home Assistant. Инсталлятор переименовывает / привязывает реальные entities под ожидаемые id и назначает Areas.

Контракт для приложения: [`docs/scenarios-ha-contract.md`](../../docs/scenarios-ha-contract.md).

---

## Спальня (area: `bedroom`)

| Entity ID | Назначение | Используется в |
|---|---|---|
| `light.bedroom` | Основной свет | scripts, bedroom devices UI |
| `cover.bedroom_curtains` | Шторы | scripts, bedroom devices UI |
| `cover.bedroom_window` | Открыватель окна | scripts, bedroom devices UI |
| `climate.bedroom_ac` | Кондиционер | scripts, bedroom devices UI |
| `climate.bedroom_ventilation` | Приточная вентиляция | scripts, bedroom devices UI |
| `climate.bedroom_radiator` | Радиатор | scripts, bedroom devices UI |
| `humidifier.bedroom` | Увлажнитель | scripts, bedroom devices UI |
| `sensor.bedroom_co2` | Датчик CO₂ | bedroom sensors UI |
| `sensor.bedroom_temperature` | Датчик температуры | bedroom sensors UI |
| `sensor.bedroom_humidity` | Датчик влажности | bedroom sensors UI |
| `binary_sensor.bedroom_occupancy` | Присутствие в спальне | automation sleep_air_quality |
| `weather.forecast_home_assistant` | Температура на улице (`attributes.temperature`) | блок «Снаружи», физика mock |
| `sun.sun` | Следующий восход / закат (`next_rising`, `next_setting`) | блок «Снаружи»: «Восход в …» / «Закат в …» |

### Climate в сценариях

Scripts отправляют `climate.set_temperature` на все три entity:

- `climate.bedroom_ac`
- `climate.bedroom_radiator`
- `climate.bedroom_ventilation`

HA применяет команду только к существующим и доступным устройствам. Если у клиента нет приточки или радиатора — соответствующий entity можно не создавать.

---

## Дом (общие)

| Entity ID | Назначение |
|---|---|
| `light.living_room` | Свет гостиной |
| `climate.living_room` | Климат гостиной |
| `sensor.living_room_temperature` | Температура для карточки «Дом» |
| `alarm_control_panel.home` | Охранная система (опционально) |

---

## Helpers и scripts (создаются пакетом)

Пакет `inputs.yaml`, `scripts.yaml`, `automations.yaml` создаёт helpers и scripts автоматически. Инсталлятор **не переименовывает** их — id фиксированы.

Проверка после установки: Developer Tools → States → найти `input_select.home_mode`, `script.evening`, `automation.evening_schedule`.
