# Глоссарий домена

| Термин в UI | Не называть | Смысл |
|-------------|-------------|--------|
| **HomeState** | entity state | Текущее «настроение» дома для человека |
| **Life state** | mode, input_select | Утро, вечер, работа, отдых, сон, гости, away — вычисляемый контекст |
| **Scenario** (сценарий) | automation, script (в UI), ritual | Сценарий жизни: Вечер, Сон, Фокус… |
| **Room** | area list + devices | Упрощённая комната с 1–2 действиями |
| **Presence** | person entity | Кто дома |
| **TimelineEvent** | logbook entry | Событие на человеческом языке |
| **GentleNotification** | alert, notification | Мягкое предложение, не тревога |
| **BedroomDevice** | light.bedroom | Управляемое устройство спальни с типом контрола |
| **BedroomDeviceState** | entity state | Текущее значение устройства + label для UI |

> **Ritual** — устаревший термин; в коде может встречаться как alias (`IRitual = IScenario`).

## Состояния сценария в UI

| Состояние карточки | Источник в HA |
|--------------------|---------------|
| **running** | transient в приложении (идёт `script.turn_on`) |
| **active** | `input_select.home_mode` = option режима |
| **prepared** | `input_boolean.home_ready_for_arrival` = on («Еду домой») |
| **idle** | иначе |

## Life states

`morning` | `evening` | `work` | `rest` | `sleep` | `guests` | `away`

Вычисляются `StateEngine` из времени суток, presence, активного сценария и сигналов датчиков.

## Mapping layer

Все `entity_id` живут в `config/home.default.yaml`, `homeConfig.ts`, контракте [scenarios-ha-contract.md](./scenarios-ha-contract.md) и `src/ha/`. UI и features работают только с domain-типами.

Параметры сценариев (яркость, расписание) — в HA helpers (`input_number`, `input_boolean`, `input_datetime`), не в локальном хранилище приложения.
