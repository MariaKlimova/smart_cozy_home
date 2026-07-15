# Установка пакета Smart Cozy Home в Home Assistant

Инсталляционный пакет создаёт helpers, 7 scripts и 3 automations с entity_id, которые ожидает мобильное приложение.

Пользователь в приложении **не устанавливает** пакет — только URL + long-lived token. Пакет ставит инсталлятор один раз.

---

## Требования

- Home Assistant OS или Core (актуальная стабильная версия)
- Доступ к конфигурации HA (File editor, Samba, SSH или Studio Code Server)
- Локальная сеть для onboarding приложения

---

## 1. Копирование пакета

Скопируйте папку `packages/ha-installer/` из репозитория в config HA:

```
/config/packages/ha-installer/
  inputs.yaml
  scripts.yaml
  automations.yaml
  DEVICES.md
  SCENARIOS.md
  INSTALL.md
```

---

## 2. Подключение в configuration.yaml

Добавьте (или дополните) секцию packages:

```yaml
homeassistant:
  packages: !include_dir_named packages/ha-installer/
```

Если packages уже используются с другим путём — скорректируйте путь к папке `ha-installer`.

---

## 3. Перезагрузка HA

1. Проверьте конфигурацию: **Developer Tools → YAML → Check Configuration**
2. Перезагрузите Home Assistant

После перезагрузки должны появиться:

- Helpers: `input_select.home_mode`, `input_number.evening_brightness`, …
- Scripts: `script.evening`, `script.sleep`, … (7 штук)
- Automations: `automation.evening_schedule`, `automation.sleep_schedule`, `automation.morning_schedule`, `automation.away_schedule`, `automation.coming_home_schedule`, `automation.cozy_schedule`, `automation.focus_schedule`, `automation.sleep_air_quality`, `automation.ac_off_when_window_open`

Уличная температура читается из `weather.forecast_home_assistant` (`attributes.temperature`) — отдельный template sensor не нужен.

---

## 4. Маппинг устройств

Переименуйте / привяжите реальные устройства под стандартные entity_id по [`DEVICES.md`](./DEVICES.md).

1. Назначьте **Areas** (спальня → `bedroom`, гостиная → `living_room`)
2. Переименуйте entities или используйте Entity Registry
3. Убедитесь, что climate-устройства спальни доступны как минимум через `climate.bedroom_ac`

---

## 5. Проверка в Developer Tools

| Проверка | Ожидание |
|---|---|
| `input_select.home_mode` | state = `none` |
| Запуск `script.evening` | `home_mode` → `evening`, свет плавно гаснет |
| Запуск `script.coming_home` | `home_ready_for_arrival` → `on`, `home_mode` → `none` |
| `input_text.evening_schedule` | state — JSON с расписанием |
| Automations | все три enabled, condition читает JSON |

---

## 6. Onboarding приложения

1. HA: Профиль → Long-Lived Access Tokens → Create Token
2. Приложение: onboarding → URL (LAN или Nabu Casa) + токен
3. Проверьте карточки сценариев на главном экране

---

## Чеклист передачи клиенту

- [ ] Все датчики спальни читаются в приложении
- [ ] `input_select.home_mode` и параметры видны в HA
- [ ] Все 7 scripts запускаются вручную из Developer Tools
- [ ] Active / prepared отображаются на карточках сценариев
- [ ] Расписание Утра настроено через приложение и срабатывает
- [ ] Клиент умеет менять яркость и время в настройках сценария

---

## Известные ограничения

- **Утро:** automation срабатывает по JSON-расписанию; плавный подъём света начинается в этот момент, а не за `morning_warmup_minutes` до подъёма.
- **Синтаксис YAML:** scripts используют `service:` и `data_template` (legacy HA). Работает на большинстве установок.

---

## Связанная документация

- [`SCENARIOS.md`](./SCENARIOS.md) — поведение каждого сценария
- [`docs/scenarios-ha-contract.md`](../../docs/scenarios-ha-contract.md) — контракт entity_id для приложения
- [`docs/ha-setup-guide.md`](../../docs/ha-setup-guide.md) — краткий путь для разработчиков
