---
name: human-timeline
description: >-
  Human-readable Timeline из logbook HA: шаблоны RU, склонения, относительное время.
  Применять при Timeline feature и copy.
---

# Human timeline

## Шаблоны (`src/copy/timeline.ts`)

- `person.home` → «Ты пришла домой» / «{name} дома»
- `ritual.evening` → «Включён вечерний режим»

## Время

- < 1 ч: «только что», «15 мин назад»
- сегодня: «в 14:30»
- иначе: «вчера», дата

## Правила

- Без entity_id в строке
- Спокойный тон (product-voice)
