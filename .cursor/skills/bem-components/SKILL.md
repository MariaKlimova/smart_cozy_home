---
name: bem-components
description: >-
  БЭМ-структура UI в apps/mobile: папка на каждый компонент (typings, styles,
  const, tsx, index), блок PascalCase, элементы BlockName-ElementName / -ElementName.
  Применять при любом новом UI, модалке, карточке, выносе разметки из экрана.
  Пути: src/ui (shared), src/features/{feature}/ui.
---

# БЭМ-компоненты — Smart House Mobile

## Где лежат компоненты

- **`apps/mobile/src/ui/`** — переиспользуемые блоки (кнопки, карточки, метрики)
- **`apps/mobile/src/features/{feature}/ui/`** — блоки фичи (HomeStateCard, RitualGrid, RoomList)

Составные экраны — композиция блоков в `app/` или крупный блок в `features/{feature}/ui/`.

**Запрещено:** одиночный `.tsx` без папки (`CalmButton.tsx` рядом с другими файлами). Каждый компонент — **своя папка**.

---

## Папка компонента (обязательно)

Каждый **блок** и каждый **элемент** — отдельная папка с **пятью файлами**:

| Файл | Содержимое |
|------|------------|
| `BlockName.tsx` | Разметка и логика компонента (`function BlockName()`). **Без** `StyleSheet.create` и без «магических» строк — только импорты. |
| `BlockName.typings.ts` | `IBlockNameProps`, локальные типы/union. JSDoc на каждом поле публичного `interface`. |
| `BlockName.styles.ts` | `StyleSheet.create({ ... })`, экспорт `styles`. Цвета/отступы — через `useThemeColors` в tsx или параметры стилей, не дублировать tokens вручную без причины. |
| `BlockName.const.ts` | Локальные константы: `testID`, длительности анимаций, пороги, ключи. Если пока нет — файл всё равно создаётся с комментарием `/** Локальные константы блока */` и минимальным экспортом (например `export const BLOCK_NAME = 'BlockName' as const` для testID). |
| `index.ts` | Публичный реэкспорт: `export { BlockName } from './BlockName'`; типы — `export type { IBlockNameProps } from './BlockName.typings'`. |

Импорты внутри папки — относительные (`./BlockName.styles`).

Снаружи папки импортируют **только** из `index.ts`:

```ts
import { CalmButton } from '@/ui/CalmButton';
```

---

## Блок

**Папка:** `BlockName/`

Имя функции = имя папки = префикс файлов: `BlockName`.

---

## Элемент

Та же схема пяти файлов, что у блока.

- **Папка:** `BlockName-ElementName/` или внутри блока `-ElementName/`
- **Файлы:** `BlockName-ElementName.tsx`, `.typings.ts`, `.styles.ts`, `.const.ts`, `index.ts`
- **Компонент в коде:** `BlockNameElementName`
- Снаружи блока элементы **не импортируются** (только из `index.ts` элемента внутри родительского блока)

Импорт внутри блока:

```ts
import { HomeStateCardHint } from './-Hint';
```

---

## Модификаторы

Через пропсы (`variant`, `size`, `isLoading`) и `styles` / themed StyleSheet. Calm-токены — skill `rn-calm-ui`.

---

## Чеклист (новый компонент)

- [ ] Папка PascalCase в `src/ui` или `src/features/*/ui`
- [ ] Пять файлов: `.tsx`, `.typings.ts`, `.styles.ts`, `.const.ts`, `index.ts`
- [ ] `IBlockNameProps` + JSDoc на полях
- [ ] Стили только в `.styles.ts`
- [ ] Константы только в `.const.ts`
- [ ] Публичный API только через `index.ts`
- [ ] Элементы не экспортируются для других фич

Примеры деревьев — [reference.md](reference.md).

---

## Миграция legacy

Существующие блоки без `.styles.ts` / `.const.ts` — при любом касании компонента довести до полной пятёрки файлов.
