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

## Папка компонента

Каждый **блок** и каждый **элемент** — отдельная папка. Минимум: `.tsx` + `index.ts` (и `.styles.ts`, если есть стили).

**Рекомендуемая** пятёрка — когда компонент нетривиальный (пропсы, стили, константы, публичный API):

| Файл | Когда нужен |
|------|-------------|
| `BlockName.tsx` | Всегда — разметка и логика. **Без** `StyleSheet.create` и без user-visible строк — только импорты. |
| `BlockName.typings.ts` | Есть пропсы / локальные типы |
| `BlockName.styles.ts` | Есть `StyleSheet` |
| `BlockName.const.ts` | Есть testID, пороги, длительности анимаций |
| `index.ts` | Всегда — публичный реэкспорт |

**Не создавай пустые файлы «для галочки»** — мелкий внутренний элемент (например, одна ячейка скелетона) может жить в одном `.tsx` внутри `-Skeleton/`.

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

Та же логика: отдельная папка, файлы по необходимости (см. таблицу выше).

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
- [ ] `.tsx` + `index.ts`; `.typings.ts` / `.styles.ts` / `.const.ts` — по необходимости
- [ ] `IBlockNameProps` + JSDoc на полях (если есть typings)
- [ ] Стили только в `.styles.ts` (если есть стили)
- [ ] Константы в `.const.ts` (если есть)
- [ ] Публичный API только через `index.ts`
- [ ] Элементы не экспортируются для других фич

Примеры деревьев — [reference.md](reference.md).

---

## Миграция legacy

Существующие блоки без `.styles.ts` / `.const.ts` — при касании компонента выноси стили и константы, если они появились; полная пятёрка не обязательна для мелких элементов.
