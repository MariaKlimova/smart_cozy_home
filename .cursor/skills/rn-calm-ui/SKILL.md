---
name: rn-calm-ui
description: >-
  Calm/warm/minimal UI для React Native: design tokens, отступы, min touch 48,
  fade-анимации. Структура файлов — skill bem-components.
---

# RN Calm UI

## Tokens (`src/theme/tokens.ts`)

- Фон: тёплый off-white / тёмный charcoal
- Акцент: приглушённый terracotta
- Текст: мягкий контраст, не чистый #000

## Layout

- Max 1 уровень на табах
- `paddingHorizontal: 20`, секции с `gap: 16`
- `minHeight: 48` для Pressable

## Анимации

- Только opacity / subtle translate
- Без bounce spring на главных действиях

## Не дублировать

Структуру папок компонентов задаёт `bem-components`.
