# AGENTS — умный дом

Роли для Cursor-агентов и handoff между задачами.

## Роли

| Агент | Зона | Когда |
|-------|------|--------|
| **Product Guardian** | UX, copy, глубина навигации | новые экраны, тексты, уведомления |
| **Domain Architect** | life states, rituals, StateEngine | domain/, mapping |
| **HA Bridge** | WebSocket, REST, reconnect | `src/ha/` |
| **Mobile Craft** | Expo, RN, БЭМ | UI, `app/`, features |
| **Calm Design** | tokens, a11y | `src/theme/`, визуал |
| **Automation Composer** | NL → YAML | post-MVP, advanced only |

## Handoff

- **UI:** Product Guardian + Calm Design + skill `bem-components` + `rn-calm-ui` + `product-voice`
- **Интеграция HA:** HA Bridge + Domain Architect + skill `ha-integration`
- **Запрет:** `entity_id` в `features/*/ui` и `app/` без mapping layer

## Стек

- `apps/mobile` — Expo Router, TypeScript strict
- HA: `home-assistant-js-websocket`, REST
- Состояние: Zustand + TanStack Query

## Skills

См. `.cursor/skills/` — `bem-components`, `product-voice`, `domain-model`, `ha-integration`, `rn-calm-ui`, `human-timeline`.
