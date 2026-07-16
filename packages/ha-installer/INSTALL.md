# Установка пакета Smart Cozy Home в Home Assistant

Инсталляционный пакет создаёт helpers, 7 scripts и automations с entity_id, которые ожидает мобильное приложение.

Пользователь в приложении **не устанавливает** пакет — только URL + long-lived token. Пакет ставит инсталлятор один раз.

---

## Требования

- Home Assistant OS или Core (актуальная стабильная версия)
- Доступ к конфигурации HA
- Mac/ПК и HA в одной локальной сети (для onboarding приложения)

---

## 1. Скопировать пакет в `/config`

Нужны **три YAML-файла** из репозитория `packages/ha-installer/`:

```
/config/packages/ha-installer/
  inputs.yaml
  scripts.yaml
  automations.yaml
```

MD-файлы (`DEVICES.md`, `SCENARIOS.md`, `INSTALL.md`) — по желанию, для справки.

### Рекомендуемый способ: File editor

Samba с Mac часто не подключается — проще через дополнение.

1. **Настройки → Дополнения → Магазин дополнений**
2. Установить **File editor** → включить **Запуск при загрузке** → **Запустить**
3. Открыть веб-интерфейс File editor
4. Создать папки: `packages` → внутри `ha-installer`
5. Создать три файла и вставить содержимое из репозитория (`Cmd+A` / `Cmd+C` / `Cmd+V`) → **Сохранить**

### Альтернативы

- Samba share → Finder `smb://<IP>/config` (на macOS часто падает с «Проблема при подключении»)
- SSH / `scp -r packages/ha-installer root@<IP>:/config/packages/`
- Studio Code Server

---

## 2. Подключить в `configuration.yaml`

В корне `/config/configuration.yaml` добавьте (или дополните) секцию:

```yaml
homeassistant:
  packages: !include_dir_named packages/ha-installer/
```

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
| Helpers | `input_select.home_mode`, `input_number.evening_brightness`, `input_text.evening_schedule`, … |
| Scripts | `script.evening`, `script.sleep`, … (7 штук) + humidifier on/off |
| Automations | `automation.evening_schedule`, … + `sleep_air_quality`, `ac_off_when_window_open` |

Проверка: **Инструменты разработчика → Состояния** → поиск `home_mode`, `script.evening`.

Уличная температура читается из `weather.forecast_home_assistant` (`attributes.temperature`) — отдельный template sensor не нужен. `sun.sun` встроенный.

---

## 4. Маппинг устройств

Пакет **не создаёт** лампы и датчики. Реальные entities переименовывают под id из [`DEVICES.md`](./DEVICES.md).

### Минимум для сценария «Вечер»

| Entity ID | Зачем |
|-----------|--------|
| `light.bedroom` | основной свет — без него режим ставится, но свет не меняется |

Остальное опционально на первом прогоне (шторы, climate, увлажнитель, ночник). Отсутствующие устройства в scripts помечены `continue_on_error: true` — сценарий не падает.

### Как переименовать

1. **Настройки → Устройства и службы → Сущности**
2. Найти лампу → изменить **Идентификатор сущности** на `light.bedroom`
3. По желанию: Area «Спальня» (`bedroom`)

Полный список и увлажнитель (`humidifier.bedroom` **или** `switch.bedroom_humidifier`): [`DEVICES.md`](./DEVICES.md).

---

## 5. Проверка сценария «Вечер»

Делайте проверки **через Действия** — так же вызывает приложение (`script.turn_on`). Запуск кнопкой ▶ на странице скрипта тоже должен работать; расхождение между ними — сигнал, что что-то не так.

| Шаг | Действие | Ожидание |
|-----|----------|----------|
| 1 | Состояния → `input_select.home_mode` | `none` |
| 2 | Действия → `script.turn_on` → цель `script.evening` **или** действие `script.evening` | выполнить |
| 3 | `home_mode` | `evening` |
| 4 | При наличии `light.bedroom` | яркость ~`input_number.evening_brightness` (по умолчанию 15%) |
| 5 | `script.coming_home` | `home_ready_for_arrival` → `on`, `home_mode` → `none` |

Если режим меняется, а свет нет:

1. Ручной тест: **Действия → `light.turn_on` → `light.bedroom` → `brightness_pct: 15`** (без «Переход» и без color_temp)
2. Если ручной тест ок, а скрипт нет — откройте **Скрипты → Вечер → Трассы** и посмотрите шаг «Гасим свет»
3. **Не включайте «Переход» (transition)** на этой лампе, если ручной тест с transition ломается — пакет специально не использует transition/color_temp

После правок только `scripts.yaml`: **YAML → Перезагрузить скрипты** (полный restart не обязателен). После правок `inputs.yaml` / `configuration.yaml` — полная перезагрузка HA.

---

## 6. Onboarding приложения

1. HA: профиль (внизу слева) → **Долгосрочные токены доступа** → создать токен (скопировать сразу)
2. Dev-сборка с реальным HA (не mock):

   ```bash
   EXPO_PUBLIC_USE_HA_MOCKS=false npx expo start
   ```

   или в `.env`: `EXPO_PUBLIC_USE_HA_MOCKS=false`

3. Приложение: onboarding → URL (`http://192.168.x.x:8123` или Nabu Casa) + токен
4. Вкладка **Сценарии** → **Вечер** → карточка active, свет тускнеет

По умолчанию в dev моки **включены** (`USE_HA_MOCKS`): без `=false` приложение не ходит в ваш HA.

---

## Типичные ошибки

| Симптом | Причина / что сделать |
|---------|------------------------|
| Check Configuration: `input_text → max, got 512` | В пакете должно быть `max: 255` (лимит HA). Обновите `inputs.yaml` из репозитория |
| Нет `script.evening` после reload YAML | Нужна **полная** перезагрузка HA |
| `home_mode` остаётся `none` после скрипта (старые scripts) | Script падал на отсутствующих устройствах до шага режима. В актуальном пакете режим ставится **первым**, устройства — с `continue_on_error` |
| Режим `evening`, свет не меняется | Нет / другой id у лампы; или лампа не принимает transition/color_temp — в пакете только `brightness_pct` |
| Ручной `light.turn_on` ок, скрипт нет | Смотреть **Трассы**; убедиться, что после правки сделали **Перезагрузить скрипты** и в UI шага яркость = 15% без transition |
| Samba с Mac: «Проблема при подключении» | Использовать File editor |
| В приложении сценарии «не работают», в HA ок | `EXPO_PUBLIC_USE_HA_MOCKS=false` + URL/токен |

### Расписание (`input_text.*_schedule`)

- `max: 255` — жёсткий лимит HA
- JSON компактный: день → `[enabled, "HH:mm"]`, например `"mon":[false,"22:30"]`
- Приложение пишет тот же компактный формат; legacy-объект `{enabled, time}` ещё читается

---

## Чеклист передачи клиенту

- [ ] Пакет в `/config/packages/ha-installer/`, packages подключены, HA перезапущен
- [ ] `input_select.home_mode` и 7 scripts видны в Состояниях
- [ ] `script.evening` через **Действия** → `home_mode = evening`
- [ ] `light.bedroom` смаплен; свет реагирует на «Вечер»
- [ ] Токен создан; приложение с `EXPO_PUBLIC_USE_HA_MOCKS=false` подключается
- [ ] Карточка «Вечер» в приложении показывает active
- [ ] (Далее) остальные устройства по [`DEVICES.md`](./DEVICES.md), расписание через настройки сценария

---

## Известные ограничения

- **Утро:** automation срабатывает по JSON-расписанию в момент времени; плавный подъём за `morning_warmup_minutes` до подъёма **не** реализован (и transition убран из scripts из‑за совместимости ламп).
- **Свет:** scripts задают только `brightness_pct` — без `transition` и `color_temp` (многие Zigbee/Tuya лампы иначе игнорируют вызов или падают).
- **Недостающие устройства:** climate/cover/humidifier могут показывать «Неизвестный объект» в UI скрипта — это нормально до маппинга; на работу сценария не влияет.
- **YAML scripts:** используется `service:` + `data:` с Jinja-шаблонами (актуальный синтаксис HA).

---

## Связанная документация

- [`SCENARIOS.md`](./SCENARIOS.md) — поведение каждого сценария
- [`DEVICES.md`](./DEVICES.md) — справочник entity_id устройств
- [`docs/scenarios-ha-contract.md`](../../docs/scenarios-ha-contract.md) — контракт для приложения
- [`docs/ha-setup-guide.md`](../../docs/ha-setup-guide.md) — краткий путь для разработчиков
