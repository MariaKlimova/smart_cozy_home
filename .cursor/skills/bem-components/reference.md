# Справочник БЭМ — Smart House

## Shared UI

```
src/ui/CalmButton/
├── CalmButton.tsx
├── CalmButton.typings.ts
└── index.ts
```

## Feature block с элементом

```
src/features/home/ui/HomeStateCard/
├── HomeStateCard.tsx
├── HomeStateCard.typings.ts
├── -Hint/
│   ├── HomeStateCard-Hint.tsx
│   └── index.ts
└── index.ts
```

- Блок: `function HomeStateCard()`
- Элемент: `function HomeStateCardHint()` в `HomeStateCard-Hint.tsx`
- Импорт внутри блока: `import { HomeStateCardHint } from "./-Hint";`
