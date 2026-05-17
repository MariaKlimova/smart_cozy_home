---
name: domain-model
description: >-
  Доменные типы умного дома: HomeState, LifeState, Ritual, Room, Presence,
  TimelineEvent, StateEngine. Применять при domain/, mappers, вычислении состояния.
---

# Domain model

## Типы (`src/domain/types.ts`)

- `LifeState` — morning | evening | work | rest | sleep | guests | away
- `HomeState` — title, hint, metrics (temp, light, security)
- `Ritual` — id, label, icon (без script entity в UI)
- `Room`, `PresenceMember`, `TimelineEvent`, `GentleNotification`

## StateEngine

Вход: время, presence[], activeRitual?, sensor snapshots из mapper.
Выход: `LifeState` + человекочитаемый `HomeState.title`.

## RitualRunner

Вызывает HA script через `ha/` layer по ritual id из config mapping.

Глоссарий: `docs/domain-glossary.md`.
