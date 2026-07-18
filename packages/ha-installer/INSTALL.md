# Установка пакета Smart Cozy Home в Home Assistant

Инсталляционный пакет создаёт helpers, 7 scripts и automations с entity_id, которые ожидает мобильное приложение.

Пользователь в приложении **не устанавливает** пакет — только URL + long-lived token. Пакет ставит инсталлятор один раз.

---

## Требования

- Home Assistant OS или Core (актуальная стабильная версия)
- Доступ к конфигурации HA через **File editor**
- Mac/ПК и HA в одной локальной сети (для onboarding приложения по LAN)

---

## Пути: репозиторий vs Home Assistant

Не путать два места:

| Где | Путь |
|-----|------|
| **Исходники в git** | `packages/ha-installer/` (в корне репозитория `smart_cozy_home`) |
| **Куда копировать на HA** | `packages/ha-installer/` **в корне конфигурации** |

В документации HA корень часто называют `/config`. В **File editor** тот же корень часто отображается как `/homeassistant` — это одно и то же. Пример с экрана:

`/homeassistant/packages/ha-installer/scripts.yaml` → пакет уже в нужном месте.

Нужны **три YAML-файла**:

```
packages/ha-installer/
  inputs.yaml
  scripts.yaml
  automations.yaml
```

(относительно корня File editor: `/homeassistant` или `/config`)

MD-файлы (`DEVICES.md`, `SCENARIOS.md`, `INSTALL.md`) — по желанию, для справки.

---

## 1. Скопировать пакет через File editor

1. **Настройки → Дополнения → Магазин дополнений**
2. Установить **File editor** → включить **Запуск при загрузке** → **Запустить**
3. Открыть веб-интерфейс File editor (корень обычно `/homeassistant` или `/config` — смотри путь в шапке редактора)
4. Создать папки: `packages` → внутри `ha-installer`
5. Создать три файла (`inputs.yaml`, `scripts.yaml`, `automations.yaml`) и вставить содержимое из репозитория → **Сохранить**

При обновлении пакета — заменить содержимое тех же трёх файлов из актуального git.

---

## 2. Подключить в `configuration.yaml`

В корне конфигурации (`configuration.yaml` рядом с папкой `packages`) добавьте (или дополните) секцию:

```yaml
homeassistant:
  packages: !include_dir_named packages/ha-installer/
```

Путь в `!include…` — **относительно корня конфига**, без `/homeassistant` и без `/config`.

Если блок `homeassistant:` уже есть — добавьте только строку `packages:` **внутрь** него, не создавая второй ключ.

Если packages уже используются с другим путём:

```yaml
homeassistant:
  packages:
    smart_cozy_inputs: !include packages/ha-installer/inputs.yaml
    smart_cozy_scripts: !include packages/ha-installer/scripts.yaml
    smart_cozy_automations: !include packages/ha-installer/automations.yaml
```

---

## 3. Проверить конфигурацию и перезапустить

1. **Инструменты разработчика → YAML → Проверить конфигурацию**
2. При ошибках — см. [Типичные ошибки](#типичные-ошибки) ниже
3. **Настройки → Система → Перезапустить Home Assistant** (полная перезагрузка, не только YAML reload)

После перезагрузки должны появиться:

| Тип | Примеры |
|-----|---------|
| Helpers | `input_select.home_mode`, `input_number.evening_brightness`, `input_number.bedroom_light_visible_min`, `input_text.evening_schedule`, … |
| Scripts | `script.evening`, `script.sleep`, `script.morning`, … (7 штук) + humidifier on/off + `script.bedroom_set_light_logical` |
| Automations | `automation.evening_schedule`, … + `sleep_air_quality`, `ac_off_when_window_open` |

Проверка: **Инструменты разработчика → Состояния** → поиск `home_mode`, `script.evening`, `bedroom_light_visible_min`.

Уличная температура читается из `weather.forecast_home_assistant` (`attributes.temperature`) — отдельный template sensor не нужен. `sun.sun` встроенный.

---

## 4. Маппинг устройств

Пакет **не создаёт** лампы и датчики. Реальные entities переименовывают под id из [`DEVICES.md`](./DEVICES.md).

Helper `input_number.bedroom_light_visible_min` пакет **создаёт сам** — это калибровка «свет виден с» для основного света, не физическое устройство.

### Минимум для сценария «Вечер»

| Entity ID | Зачем |
|-----------|--------|
| `light.bedroom` | основной свет — без него режим ставится, но свет не меняется |

Остальное опционально на первом прогоне (шторы, climate, увлажнитель, ночник). Отсутствующие устройства в scripts помечены `continue_on_error: true` — сценарий не падает.

### Как переименовать

1. **Настройки → Устройства и службы → Сущности**
2. Найти лампу → изменить **Идентификатор сущности** на `light.bedroom`
3. По желанию: Area «Спальня» (`bedroom`) — для удобства в HA; приложение для таба «Комнаты» Areas не требует

Полный список и увлажнитель (`humidifier.bedroom` **или** `switch.bedroom_humidifier`): [`DEVICES.md`](./DEVICES.md).

---

## 5. Проверка сценария «Вечер»

Делайте проверки **через Действия** — так же вызывает приложение (`script.turn_on`). Запуск кнопкой ▶ на странице скрипта тоже должен работать; расхождение между ними — сигнал, что что-то не так.

| Шаг | Действие | Ожидание |
|-----|----------|----------|
| 1 | Состояния → `input_select.home_mode` | `none` |
| 2 | Действия → `script.turn_on` → цель `script.evening` **или** действие `script.evening` | выполнить |
| 3 | `home_mode` | `evening` |
| 4 | При наличии `light.bedroom` | яркость ≈ логические `%` из `evening_brightness`, пересчитанные через `bedroom_light_visible_min` (при пороге 0 — как в helper, по умолчанию 15%) |
| 5 | `script.coming_home` | `home_ready_for_arrival` → `on`, `home_mode` → `none` |

Если режим меняется, а свет нет:

1. Ручной тест: **Действия → `light.turn_on` → `light.bedroom` → `brightness_pct: 15`** (без «Переход» / transition и без color_temp)
2. Если ручной тест ок, а скрипт нет — **Скрипты → Вечер → Трассы**, шаг «Гасим свет»
3. Пакет **не использует** `transition` / `color_temp` — на многих лампах они ломают или игнорируют вызов

После правок только `scripts.yaml`: **YAML → Перезагрузить скрипты** (полный restart не обязателен). После правок `inputs.yaml` / `configuration.yaml` — полная перезагрузка HA.

### Утро и остановка ramp

`script.morning` поднимает яркость **софтовым ramp** (шаги + `delay`, без transition), длительность — `morning_warmup_minutes`.

Повторный тап по активному режиму в приложении: `home_mode = none` **и** `script.turn_off` на script режима — иначе delay-шаги продолжатся после «отжима» в UI.

Краткий тест Утра: поставьте `morning_warmup_minutes = 5`, запустите `script.morning`, убедитесь в росте яркости; `script.turn_off` на `script.morning` — следующие шаги не должны приходить.

---

## 6. Onboarding приложения

1. HA: профиль (внизу слева) → **Долгосрочные токены доступа** → создать токен (скопировать сразу)
2. Dev-сборка с реальным HA. По умолчанию моки **выключены**; для явного режима:

   ```bash
   EXPO_PUBLIC_USE_HA_MOCKS=false npx expo start
   ```

   Чтобы гонять UI без HA: `EXPO_PUBLIC_USE_HA_MOCKS=true`.

3. Приложение: onboarding → URL (`http://192.168.x.x:8123` или Nabu Casa) + токен
4. Вкладка **Сценарии** → **Вечер** → карточка active, свет тускнеет
5. Спальня → основной свет → при необходимости калибровка «Свет виден с»

---

## Типичные ошибки

| Симптом | Причина / что сделать |
|---------|------------------------|
| Check Configuration: `input_text → max, got 512` | В пакете должно быть `max: 255` (лимит HA). Обновите `inputs.yaml` из репозитория |
| Нет `script.evening` после reload YAML | Нужна **полная** перезагрузка HA |
| `home_mode` остаётся `none` после скрипта (старые scripts) | Script падал на отсутствующих устройствах до шага режима. В актуальном пакете режим ставится **первым**, устройства — с `continue_on_error` |
| Режим `evening`, свет не меняется | Нет / другой id у лампы; или лампа не принимает лишние поля — в пакете только `brightness_pct` (+ remap через `bedroom_light_visible_min`) |
| Ручной `light.turn_on` ок, скрипт нет | Смотреть **Трассы**; после правки — **Перезагрузить скрипты**; в UI шага яркость без transition |
| Отжал «Утро» в приложении, яркость всё ещё растёт | Старый пакет / старое приложение без `script.turn_off`. Обновите app; проверьте, что exit вызывает turn_off |
| В приложении сценарии «не работают», в HA ок | Нет URL/токена или включены моки (`EXPO_PUBLIC_USE_HA_MOCKS=true`) — в Настройках sync смотрите «Моки: вкл/выкл» |

### Расписание (`input_text.*_schedule`)

- `max: 255` — жёсткий лимит HA
- JSON компактный: день → `[enabled, "HH:mm"]`, например `"mon":[false,"22:30"]`
- Приложение пишет тот же компактный формат; legacy-объект `{enabled, time}` ещё читается

---

## Чеклист передачи клиенту

- [ ] Пакет в `packages/ha-installer/` в корне конфига (три YAML; в File editor часто `/homeassistant/packages/…`), packages подключены в `configuration.yaml`, HA перезапущен
- [ ] `input_select.home_mode`, `input_number.bedroom_light_visible_min` и 7 scripts видны в Состояниях
- [ ] `script.evening` через **Действия** → `home_mode = evening`
- [ ] `light.bedroom` смаплен; свет реагирует на «Вечер»
- [ ] Токен создан; приложение подключается к HA (моки выкл)
- [ ] Карточка «Вечер» в приложении показывает active
- [ ] (Далее) остальные устройства по [`DEVICES.md`](./DEVICES.md), калибровка света, расписание через настройки сценария

---

## Известные ограничения

- **Утро:** soft ramp без hardware `transition` (на многих лампах transition ломает вызов). Подъём — шаги `brightness_pct` + `delay` на `morning_warmup_minutes`. Отжим режима должен сопровождаться `script.turn_off`.
- **Свет:** scripts не используют `transition` / `color_temp`. Яркость `light.bedroom` проходит через `bedroom_light_visible_min` (логические % → `[min, 100]`).
- **Недостающие устройства:** climate/cover/humidifier могут показывать «Неизвестный объект» в UI скрипта — это нормально до маппинга; на работу сценария не влияет (`continue_on_error`).
- **YAML scripts:** используется `service:` + `data:` с Jinja-шаблонами (актуальный синтаксис HA).

---

## Связанная документация

- [`SCENARIOS.md`](./SCENARIOS.md) — поведение каждого сценария
- [`DEVICES.md`](./DEVICES.md) — справочник entity_id устройств
- [`docs/scenarios-ha-contract.md`](../../docs/scenarios-ha-contract.md) — контракт для приложения
- [`docs/ha-setup-guide.md`](../../docs/ha-setup-guide.md) — краткий путь для разработчиков
