# Глоссарий домена

| Термин в UI | Не называть | Смысл |
|-------------|-------------|--------|
| **HomeState** | entity state | Текущее «настроение» дома для человека |
| **Life state** | mode, input_select | Утро, вечер, работа, отдых, сон, гости, away — вычисляемый контекст |
| **Ritual** | automation, script (в UI) | Сценарий жизни: Вечер, Сон, Фокус… |
| **Room** | area list + devices | Упрощённая комната с 1–2 действиями |
| **Presence** | person entity | Кто дома |
| **TimelineEvent** | logbook entry | Событие на человеческом языке |
| **GentleNotification** | alert, notification | Мягкое предложение, не тревога |
| **BedroomDevice** | light.bedroom | Управляемое устройство спальни с типом контрола |
| **BedroomDeviceState** | entity state | Текущее значение устройства + label для UI |

## Life states

`morning` | `evening` | `work` | `rest` | `sleep` | `guests` | `away`

Вычисляются `StateEngine` из времени суток, presence, активного ритуала и сигналов датчиков.

## Mapping layer

Все `entity_id` живут только в `config/home.default.yaml`, `homeConfig.typings.ts`, `homeConfig.ts` и `src/ha/`. UI и features работают только с domain-типами.
