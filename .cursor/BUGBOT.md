# Bugbot — smart_cozy_home

> **Cloud Bugbot на PR временно выключен** (настройка в [Cursor dashboard](https://cursor.com/dashboard/bugbot)).
> Этот файл по-прежнему используется локальным subagent [Code Review](.cursor/agents/code-review.md) и `/review-bugbot`.

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
4. `src/domain/` — HomeState, Scenario, StateEngine (**без React**)
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
- Элементы: папка `BlockName-ElementName/` или `-ElementName/`; файлы по необходимости (skill `bem-components`); снаружи родительского блока не экспортируются.

If a new or changed component is a single `.tsx` file without its own folder:

- Add a **blocking** finding: «Каждый UI-компонент — папка с .tsx, .typings.ts, .styles.ts, .const.ts, index.ts».

If `StyleSheet.create` appears in `*.tsx` under `src/ui/**` or `features/**/ui/**` (not in `*.styles.ts`):

- Add a **blocking** finding: «Стили выноси в BlockName.styles.ts».

If component-local string/number literals (testID, durations, labels not from `src/copy/`) live in `.tsx` instead of `*.const.ts`:

- Add a non-blocking finding: «Константы — в BlockName.const.ts».

If a folder is missing optional files (`.typings.ts`, `.styles.ts`, `.const.ts`) but компонент простой и без соответствующей логики:

- Do **not** add a blocking finding — пятёрка рекомендуемая, не обязательная (skill `bem-components`).

If a folder is missing `index.ts` or `.tsx`:

- Add a **blocking** finding.

If a new UI component is placed directly in `app/` with substantial markup instead of `src/features/*/ui/` or `src/ui/`:

- Add a non-blocking finding: «Вынеси разметку в БЭМ-блок в features/ui или src/ui».

---

## Product voice и copy

When reviewing `apps/mobile/app/**`, `apps/mobile/src/features/**/ui/**`, `apps/mobile/src/ui/**`, `apps/mobile/src/copy/**`:

**Запрещено в пользовательских строках:**

- `entity_id`, `device_class`, `automation`, `script_id`, сырые state из HA
- CAPS, восклицания, приказной тон
- **Захардкоженный user-visible текст** в UI-слое вместо `copy` из `src/copy/`

**Ожидается:**

- Спокойный, тёплый тон на «ты»
- Контекст комнаты/ритуала вместо «свет включён»
- Все пользовательские строки — из `apps/mobile/src/copy/ru.ts` (или `src/copy/timeline.ts` для Timeline)
- Импорт: `import { copy } from '@/copy/ru'` (или `@/copy/timeline`)
- В JSX/пропсах UI: `copy.section.key`, не литералы `'…'` / `"…"`

**Допустимые литералы в UI (не считать нарушением):**

- `testID`, `accessibilityHint` — в `*.const.ts`, не user-facing copy
- Служебные символы: `'—'`, `'·'`, `'/'`, пустая строка `''`
- Технические ключи: `keyboardType`, `autoComplete`, enum-like internal keys
- Интерполяция **из** `copy`: `` `${copy.foo} ${value}` ``, `copy.bar.replace(...)`
- Числа, проценты, единицы без слов (`'48'`, `'#fff'`) — если не заменяются copy

If a changed file under `apps/mobile/app/`, `apps/mobile/src/features/**/ui/`, or `apps/mobile/src/ui/` contains a **new or modified** user-visible string literal (кириллица/латиница ≥2 символов) in:

- JSX text nodes (`<Text>…</Text>`, `<Button title="…">`),
- props: `title`, `label`, `placeholder`, `accessibilityLabel`, `headerTitle`, `emptyText`, `hint`, `message`, `description`, `subtitle`,
- `Alert.alert('…', '…')`, `Toast.show({ text: '…' })`,

and the string is **not** imported from `@/copy/ru` or `@/copy/timeline`, then:

- Add a **blocking** finding: «User-visible строка захардкожена — вынеси в `src/copy/ru.ts` и используй `copy.*`».
- Предложи ключ в структуре `copy` (секция + имя поля).

If the same string already exists in `ru.ts` but компонент дублирует литерал вместо `copy.*`:

- Add a **blocking** finding: «Строка уже есть в copy — используй существующий ключ `copy.<path>`».

If user-visible strings contain HA jargon or raw entity identifiers:

- Add a **blocking** finding with a human-readable alternative.

---

## Calm UI и design tokens

When reviewing `apps/mobile/app/**`, `apps/mobile/src/features/**/ui/**`, `apps/mobile/src/ui/**`, `apps/mobile/src/theme/**`:

**Источник правды:** `apps/mobile/src/theme/tokens.ts`

- **Цвета** — через `useThemeColors()` → `colors[scheme]` из tokens; в JSX/style props: `c.background`, `c.text`, … Не hex/rgb/rgba литералы.
- **Отступы** — `spacing.xs | sm | md | lg | xl` (padding, margin, gap).
- **Скругления** — `radii.sm | md`.
- **Touch target** — `touchMin` (48) для интерактивных элементов.
- **Типографика** — `typography.title | subtitle | body | caption`.

**Импорт в `*.styles.ts`:**

```ts
import { radii, spacing, touchMin, typography } from '@/theme/tokens';
```

**Цвета в компонентах:**

```ts
import { useThemeColors } from '@/hooks/useThemeColors';
// ...
const c = useThemeColors();
// style={{ backgroundColor: c.surface, color: c.text }}
```

**Допустимые литералы (не нарушение):**

- `0`, `1` (borderWidth, hairline)
- `'transparent'`, `'100%'`, flex/position/zIndex/transform
- `opacity` от 0 до 1
- Арифметика **на базе tokens**: `spacing.lg + 6`, `touchMin / 2`
- Файл `src/theme/tokens.ts` — единственное место для новых значений палитры/шкалы

If a changed file under UI-слоя (`app/`, `features/**/ui/`, `src/ui/`) contains a **new or modified** hardcoded:

- **цвет**: `#[0-9A-Fa-f]{3,8}`, `rgb(`, `rgba(` в `*.tsx`, `*.styles.ts` (кроме `tokens.ts`),
- **отступ**: `padding*`, `margin*`, `gap` с числом не из `spacing.*` (например `padding: 20`, `marginTop: 12`),
- **радиус**: `borderRadius: N` не из `radii.*`,
- **touch**: `minHeight` / `minWidth` на Pressable/Button < `touchMin` или magic 48 вместо `touchMin`,
- **типографика**: новый набор `fontSize` + `fontWeight` вместо spread `typography.*`,

then:

- Add a **blocking** finding: «Используй tokens из `@/theme/tokens` (и `useThemeColors` для цветов)».
- Укажи конкретный token: `spacing.md`, `radii.sm`, `c.accent`, `typography.body`.

If the same hex/spacing value already exists in `tokens.ts` but компонент дублирует литерал:

- Add a **blocking** finding с именем существующего token.

- Минимальная зона нажатия — `touchMin` (48dp) для интерактивных элементов.
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

- StateEngine, scenarios, life states — чистая логика без side effects UI.
- Не протаскивать `entity_id` в domain-типы, если есть domain-абстракция.

---

## Дублирование кода

When reviewing any changed file under `apps/mobile/**` or `packages/ha-installer/**`:

**Что искать (поиск по репозиторию обязателен, не только diff):**

1. **Copy** — одна и та же user-visible строка или её вариация уже есть в `src/copy/ru.ts` или другом компоненте.
2. **Логика** — блок ≥8 строк (условия, маппинг, парсинг, расчёт) повторяется в другом файле или в том же PR в другом месте.
3. **Типы и константы** — одинаковые `interface`, union, enum, magic numbers/strings в нескольких файлах вместо общего модуля.
4. **HA / config** — повтор mapping `entity_id` → domain, дубли `call_service`, одинаковые списки устройств в `config/` и `ha/`.
5. **UI** — одинаковая разметка, стили или hook-паттерн в двух БЭМ-блоках без общего `@/ui/` компонента.
6. **YAML / installer** — одинаковые sequence/script steps в `packages/ha-installer/` без шаблона или `!include`.

**Как проверять:**

- Для каждого нового/изменённого блока логики — `grep` по характерным идентификаторам, строкам, сигнатурам функций.
- Сравни diff **внутри PR**: один и тот же паттерн в двух добавленных файлах — тоже дубль.
- Игнорируй тривиальные совпадения: однострочные re-export, стандартные import, boilerplate `index.ts`, тестовые `describe/it`.

**Severity:**

If duplicated logic ≥8 строк or duplicated HA mapping / entity lists across layers, then:

- Add a **blocking** finding: «Дублирование логики — вынеси в общий модуль».
- Укажи **оба файла** (источник и дубль) и куда вынести: `src/domain/`, `src/features/*/lib/`, `src/ha/mappers/`, `src/ui/`, `src/copy/ru.ts`, `*.const.ts`.

If duplicated copy strings, duplicated StyleSheet blocks, or duplicated constants (3+ совпадения или ≥4 строки), then:

- Add a non-blocking finding с конкретным местом для DRY: `ru.ts`, shared UI, `*.const.ts`, helper в `lib/`.

If the PR **extracts** shared code and removes duplication — отметь в «Что проверено и чисто», не поднимай finding.

---

## Мёртвый код

When reviewing any changed file under `apps/mobile/**` or `packages/ha-installer/**`:

**Что считать мёртвым кодом:**

1. **Неиспользуемый export** — `export function`, `export const`, `export type`, компонент без импортов снаружи (grep по репозиторию).
2. **Orphan-файл** — новый `.ts`/`.tsx` в diff, который никто не импортирует (кроме entry points: `app/**`, `index.ts` barrel).
3. **Недостижимый код** — statements после `return` / `throw` / `break` / `continue`; ветки `if (false)`, `if (true) return` с мёртвым else.
4. **Закомментированный код** — блоки ≥3 строк закомментированной логики в diff (не JSDoc, не TODO).
5. **Устаревшие ключи** — поле в `copy/ru.ts`, константа в `*.const.ts`, export в `index.ts`, на которое больше нет ссылок после рефактора в том же PR.
6. **Stale imports** — import, который не используется (если `npm run lint` / typecheck это не ловит — всё равно finding).

**Как проверять:**

- Запусти `npm run quality` из корня репозитория; unused/unreachable из lint/tsc — включай в findings.
- Для **каждого нового export** в diff — `grep` по имени символа (`apps/mobile`, `packages/`); 0 usages вне файла определения и тестов → finding.
- Для **удалённых вызовов** в diff — проверь, не осталась ли без ссылок функция/тип/константа в том же PR.
- Entry points **не** считай orphan: `apps/mobile/app/**` (Expo Router), корневые providers.
- Типы, используемые только как `import type` — проверяй отдельно; не помечай мёртвыми без grep `: ITypeName` / `extends ITypeName`.

**Severity:**

If the PR **adds** a new export (function, component, const, type) with **zero** references outside its file and tests, then:

- Add a **blocking** finding: «Мёртвый код — export не используется; удали или подключи».
- Укажи символ и файл.

If the PR adds a new file that is never imported (not an Expo route), then:

- Add a **blocking** finding: «Orphan-файл — нет импортов; подключи или удали».

If unreachable code or commented-out blocks (≥3 lines) appear in changed files, then:

- Add a non-blocking finding: «Недостижимый / закомментированный код — удали».

If orphaned `copy.*` keys, `*.const.ts` values, or stale helpers remain after refactor in the same PR, then:

- Add a non-blocking finding с символом и предложением удалить.

If the PR **removes** dead code — отметь в «Что проверено и чисто», не поднимай finding.

Не дублируй каждый `no-unused-vars` из ESLint отдельным finding — сгруппируй: «lint: N неиспользуемых import/vars в файлах …».

---

## Чистота кода

When reviewing any PR that adds or substantially changes hooks, lib, mappers,
screens, or control Cards under `apps/mobile/**` (or orchestration scripts under
`packages/ha-installer/**`):

**Цель:** ловить то, что ломает сопровождение — God-объекты, скрытые side-effects,
нечитаемые цепочки, жёсткую связанность — не стиль ради стиля.

**Кандидаты:** новый модуль (не тест/styles/copy); ≥20 LOC net в хуке/lib/mapper/
screen; оркестрация (`use*`, `prepare*`, `write*`, `map*`); файл ≥250 строк или
PR добавляет новую зону ответственности в раздутый модуль.

**Проверяй по каждому кандидату (отдельный проход, не хвост к дублям/мёртвому коду):**

1. **SRP** — load + write + queue + UI-state в одном без оркестрации; `utils`/`helpers`-свалка.
2. **Имя = поведение** — `load*`/`refresh*`/`prepare*`/`set*`/`map*` не должны молча писать в HA/store без JSDoc.
3. **Проза** — цепочки 3+ шагов не прыгают по 4+ файлам без фасада.
4. **Coupling** — одни ключи/device id размазаны по feature; скрытый чужой store.
5. **Boy scout** — мёртвый export / one-liner / устаревший комментарий рядом с hunk.
6. **Trade-offs** (очередь записей, silent catch после write, фасад хука) — не finding; отметь в «чисто».

If the PR *adds* a new responsibility into an already God-sized module without extraction, then:

- Add a **blocking** finding: «Ухудшение SRP — вынеси новую зону в отдельный модуль».

If a function name lies about side-effects in a way that misleads callers (contract risk), then:

- Add a **blocking** finding: «Имя врёт про side-effects — переименуй или задокументируй JSDoc».

If God-module / utils dump / heavy chain / key coupling / boy-scout noise without worsening SRP in this PR, then:

- Add a non-blocking finding с конкретным файлом и предложением выноса/чистки.

Local Code Review agent **must** fill the «§3.5 проход» table (one row per candidate)
even when there are zero clean-code findings — see `.cursor/agents/code-review.md`.

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

GitHub Actions job `quality` запускает `npm run typecheck` и `npm run lint`. Cloud Bugbot в Actions **не** запускается. Не комментируй стилистику, которую уже ловит ESLint, если это не архитектурный риск — **кроме** cross-file мёртвых exports и orphan-файлов (см. «Мёртвый код») и нарушений SRP / лживых имён из «Чистота кода».
