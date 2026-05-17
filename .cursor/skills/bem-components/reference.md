# Справочник БЭМ — Smart House

## Shared UI (блок)

```
src/ui/CalmButton/
├── CalmButton.tsx
├── CalmButton.typings.ts
├── CalmButton.styles.ts
├── CalmButton.const.ts
└── index.ts
```

**index.ts**

```ts
export { CalmButton } from './CalmButton';
export type { ICalmButtonProps } from './CalmButton.typings';
```

**CalmButton.tsx** — импортирует `./CalmButton.styles`, `./CalmButton.const`, типы из `./CalmButton.typings`.

---

## Feature block с элементом

```
src/features/home/ui/HomeStateCard/
├── HomeStateCard.tsx
├── HomeStateCard.typings.ts
├── HomeStateCard.styles.ts
├── HomeStateCard.const.ts
├── index.ts
└── -Hint/
    ├── HomeStateCard-Hint.tsx
    ├── HomeStateCard-Hint.typings.ts
    ├── HomeStateCard-Hint.styles.ts
    ├── HomeStateCard-Hint.const.ts
    └── index.ts
```

- Блок: `function HomeStateCard()`
- Элемент: `function HomeStateCardHint()` в `HomeStateCard-Hint.tsx`
- Импорт внутри блока: `import { HomeStateCardHint } from './-Hint';`

**index.ts элемента**

```ts
export { HomeStateCardHint } from './HomeStateCard-Hint';
export type { IHomeStateCardHintProps } from './HomeStateCard-Hint.typings';
```

---

## Антипаттерны

| Плохо | Хорошо |
|-------|--------|
| `src/ui/CalmButton.tsx` без папки | `src/ui/CalmButton/CalmButton.tsx` + остальные файлы |
| `StyleSheet.create` внутри `.tsx` | `BlockName.styles.ts` |
| `const LABEL = '…'` в `.tsx` | `BlockName.const.ts` |
| Импорт `from './CalmButton.tsx'` | `from '@/ui/CalmButton'` (через `index.ts`) |
| Один `types.ts` на всю фичу | Типы у каждого блока в своём `.typings.ts` |
