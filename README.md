# Умный дом

Эмоциональный интерфейс для умного дома поверх [Home Assistant](https://www.home-assistant.io/). Продукт говорит языком состояний жизни — утро, вечер, сон, гости — а не entities и automations.

## Структура

- `apps/mobile` — React Native (Expo), iOS + Android
- `config/` — mapping ритуалов и сущностей HA
- `docs/` — продуктовые принципы и глоссарий
- `.cursor/` — правила и skills для AI-разработки

## Запуск

```bash
cd apps/mobile
npm install
npm start
```

Первый запуск откроет onboarding: URL Home Assistant (локальный и/или удалённый) и long-lived access token.

## Home Assistant

См. [docs/ha-setup-guide.md](docs/ha-setup-guide.md).
