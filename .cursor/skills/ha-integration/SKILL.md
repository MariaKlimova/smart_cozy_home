---
name: ha-integration
description: >-
  Home Assistant WebSocket и REST в apps/mobile/src/ha: ConnectionProfile,
  ConnectionManager LAN/remote failover, health check, entity subscriptions.
---

# HA integration

## ConnectionProfile

- `localUrl`, `remoteUrl`, `accessToken`, `preferred: auto | local | remote`
- Хранение: `expo-secure-store`

## ConnectionManager

1. Health-check `GET {baseUrl}/api/` с `Authorization: Bearer {token}`
2. `preferred: auto` — сначала local, затем remote
3. Единый `activeBaseUrl` для REST и WebSocket

## Подписки

Только entity_id из `config/home.default.yaml` — не весь HA.

## Сервисы

`callScript(domain, service)` через REST `POST /api/services/{domain}/{service}`.

Mapping: `loadHomeConfig()` → typed config из YAML.

Отладка подключения — экран «Проверка данных» и «Список устройств HA» в настройках, без console.log в production.
