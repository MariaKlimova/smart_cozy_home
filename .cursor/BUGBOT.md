# Bugbot — smart_house

Проект: эмоциональный UI-слой умного дома поверх Home Assistant. Основной код — `apps/mobile` (Expo Router, TypeScript strict).

## Общие принципы

- Ревью на русском, тон спокойный и конкретный.
- Различай **блокирующие** проблемы (архитектура, утечки секретов, сломанная типизация) и **рекомендации** (стиль, мелкий copy).
- Не предлагай рефакторинг вне scope PR без явной пользы.

---

## Архитектура mobile (блокирующие)

Слои:

1. `app/` — маршруты Expo Router, композиция экранов
2. `src/features/*/ui/` — БЭМ-блоки фич (только domain-типы в пропсах)
3. `src/ui/` — переиспользуемые БЭМ-блоки
4. `src/domain/` — HomeState, Ritual, StateEngine (**без React**)
5. `src/ha/` — ConnectionManager, клиент, mappers

If any changed file under `apps/mobile/app/`, `apps/mobile/src/features/**/ui/`, or `apps/mobile/src/ui/`:

- imports from `home-assistant-js-websocket`, or
- calls `call_service`, opens WebSocket, or uses raw `entity_id` in component props without going through domain types / mappers,

then:

- Add a **blocking** finding: «Логика HA должна быть в `src/ha/` или `src/features/*/model`, UI получает только domain-типы».
- Suggest moving logic to `src/ha/` or feature model layer.

If any changed file under `apps/mobile/src/domain/` imports `react`, `react-native`, or hooks:

- Add a **blocking** finding: «Domain-слой не должен зависеть от React».

---

## TypeScript (блокирующие / важные)

If a changed file adds or modifies a public `interface` and any field lacks a JSDoc comment (`/** ... */`):

- Add a **blocking** finding: «У каждого поля публичного interface нужен JSDoc».

If a changed file contains a nested ternary expression:

- Add a **blocking** finding: «Вложенные тернарные операторы запрещены — используй if/else или ранний return».

---

## UI: БЭМ и структура файлов

When reviewing `apps/mobile/src/ui/**` or `apps/mobile/src/features/**/ui/**`:

Каждый **блок** и **элемент** — отдельная папка PascalCase с **пятью файлами**:

1. `BlockName.tsx` — разметка/логика (без `StyleSheet.create` и без локальных magic strings)
2. `BlockName.typings.ts` — `IBlockNameProps`, JSDoc на полях
3. `BlockName.styles.ts` — `StyleSheet.create`
4. `BlockName.const.ts` — локальные константы (testID, пороги, длительности)
5. `index.ts` — публичный реэкспорт

Правила:

- Импорт снаружи — только из `index.ts` папки (`@/ui/BlockName`, не из `.tsx` напрямую).
- Элементы: папка `BlockName-ElementName/` или `-ElementName/`, та же пятёрка файлов; снаружи родительского блока не экспортируются.

If a new or changed component is a single `.tsx` file without its own folder:

- Add a **blocking** finding: «Каждый UI-компонент — папка с .tsx, .typings.ts, .styles.ts, .const.ts, index.ts».

If `StyleSheet.create` appears in `*.tsx` under `src/ui/**` or `features/**/ui/**` (not in `*.styles.ts`):

- Add a **blocking** finding: «Стили выноси в BlockName.styles.ts».

If component-local string/number literals (testID, durations, labels not from `src/copy/`) live in `.tsx` instead of `*.const.ts`:

- Add a non-blocking finding: «Константы — в BlockName.const.ts».

If a folder is missing `index.ts`, `.typings.ts`, `.styles.ts`, or `.const.ts`:

- Add a **blocking** finding with the list of missing files.

If a new UI component is placed directly in `app/` with substantial markup instead of `src/features/*/ui/` or `src/ui/`:

- Add a non-blocking finding: «Вынеси разметку в БЭМ-блок в features/ui или src/ui».

---

## Product voice и copy

When reviewing `apps/mobile/app/**`, `apps/mobile/src/features/**/ui/**`, `apps/mobile/src/copy/**`:

**Запрещено в пользовательских строках:**

- `entity_id`, `device_class`, `automation`, `script_id`, сырые state из HA
- CAPS, восклицания, приказной тон

**Ожидается:**

- Спокойный, тёплый тон на «ты»
- Контекст комнаты/ритуала вместо «свет включён»
- Copy в `apps/mobile/src/copy/ru.ts`, не размазанный по компонентам

If user-visible strings contain HA jargon or raw entity identifiers:

- Add a **blocking** finding with a human-readable alternative.

---

## Calm UI

When reviewing UI components and `apps/mobile/src/theme/**`:

- Используй design tokens из `src/theme/tokens.ts`, не magic numbers для цветов/отступов без причины.
- Минимальная зона нажатия — 48dp для интерактивных элементов.
- Избегай резких анимаций; предпочитай fade/мягкие переходы.

---

## HA Bridge (`src/ha/`)

When reviewing `apps/mobile/src/ha/**`:

- Проверь, что токены и URL не логируются в открытом виде (используй masking).
- Reconnect и failover должны быть централизованы в ConnectionManager, не дублироваться в UI.
- Mapping entity → domain только в `src/ha/mappers/` и config, не в UI.

If secrets or tokens appear in logs, comments, or user-visible strings:

- Add a **blocking** security finding.

---

## Domain (`src/domain/`)

When reviewing `apps/mobile/src/domain/**`:

- StateEngine, rituals, life states — чистая логика без side effects UI.
- Не протаскивать `entity_id` в domain-типы, если есть domain-абстракция.

---

## Зоны ревью по diff

| Путь diff | Фокус |
|-----------|--------|
| `apps/mobile/app/`, `features/*/ui/` | Product Guardian, Calm Design, БЭМ, product-voice |
| `apps/mobile/src/domain/` | Domain Architect, чистота domain |
| `apps/mobile/src/ha/` | HA Bridge, reconnect, masking |
| `apps/mobile/src/copy/` | product-voice, RU copy, human-timeline |

---

## CI

GitHub Actions job `quality` запускает `npm run typecheck` и `npm run lint`. Не комментируй стилистику, которую уже ловит ESLint, если это не архитектурный риск.
