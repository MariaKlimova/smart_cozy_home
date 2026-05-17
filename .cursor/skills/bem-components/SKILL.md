---
name: bem-components
description: >-
  БЭМ-структура UI в apps/mobile: блок PascalCase, элементы BlockName-ElementName /
  папка -ElementName, IBlockNameProps, index.ts. Применять при любом новом UI,
  модалке, карточке, выносе разметки из экрана. Пути: src/ui (shared), src/features/{feature}/ui.
---

# БЭМ-компоненты — Smart House Mobile

## Где лежат компоненты

- **`apps/mobile/src/ui/`** — переиспользуемые блоки (кнопки, карточки, метрики)
- **`apps/mobile/src/features/{feature}/ui/`** — блоки фичи (HomeStateCard, RitualGrid, RoomList)

Составные экраны — композиция блоков в `app/` или крупный блок в `features/{feature}/ui/`.

## Блок

**Папка:** `BlockName/`

| Файл | Содержимое |
|------|------------|
| `BlockName.tsx` | `function BlockName()` |
| `BlockName.typings.ts` | `IBlockNameProps` |
| `index.ts` | публичный экспорт |

## Элемент

- Папка: `BlockName-ElementName/` или `-ElementName/`
- Файл: `BlockName-ElementName.tsx`
- Компонент в коде: `BlockNameElementName`
- Снаружи блока элементы **не импортируются**

## Модификаторы

Через пропсы (`variant`, `size`, `isLoading`) и `style` / themed StyleSheet. Calm-токены — skill `rn-calm-ui`.

## Чеклист

- [ ] PascalCase папка блока в `src/ui` или `src/features/*/ui`
- [ ] `BlockName.typings.ts` + `IBlockNameProps`
- [ ] `index.ts` экспортирует только блок
- [ ] Элементы не экспортируются для других фич

Примеры деревьев — [reference.md](reference.md).
