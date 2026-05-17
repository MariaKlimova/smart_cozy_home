---
name: product-voice
description: >-
  Tone of voice и запрет HA-жаргона в UI умного дома. Применять при экранах,
  подсказках, уведомлениях, Timeline, onboarding.
---

# Product voice

## Запрещено в UI

- entity_id, device_class, automation, YAML, script_id
- «Свет включён» без контекста комнаты/ритуала — лучше «В гостиной приглушённый свет»

## Тон

- Спокойный, тёплый, на «ты»
- Без восклицаний и CAPS
- Предложения, не приказы: «Включить вечерний режим?»

## Примеры

| Плохо | Хорошо |
|-------|--------|
| `light.bedroom state: off` | Похоже, в спальне темно — включить свет? |
| Automation triggered | Включён вечерний режим |
| person.maria: home | Ты дома |

Copy хранить в `apps/mobile/src/copy/ru.ts`.
