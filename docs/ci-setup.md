# CI/CD и Bugbot

## GitHub Actions (CI)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

**Триггеры:** push в `main`, все `pull_request`.

**Проверки:**

```bash
npm ci
npm run typecheck   # tsc --noEmit в apps/mobile
npm run lint        # eslint в apps/mobile
```

**Локально** (из корня репозитория):

```bash
npm ci
npm run quality   # typecheck + lint
```

### Pre-commit (Husky)

После `npm install` хук ставится автоматически (`prepare` → `husky`).

Перед каждым коммитом выполняется `npm run quality`. Обойти в крайнем случае: `git commit --no-verify`.

### Branch protection

1. GitHub → репозиторий → **Settings** → **Branches** → правило для `main`.
2. Включить **Require status checks to pass**.
3. Выбрать check **`quality`** (job из workflow `CI`).

## Cursor Bugbot (AI-ревью PR)

Bugbot анализирует diff и оставляет inline-комментарии. Правила проекта — в [`.cursor/BUGBOT.md`](../.cursor/BUGBOT.md).

### Подключение (один раз)

1. [Cursor → Integrations → GitHub](https://cursor.com/docs/integrations/github) — установить GitHub App на организацию или репозиторий.
2. [Bugbot dashboard](https://cursor.com/dashboard/bugbot) — включить репозиторий `smart_house`.
3. (Команда) При необходимости — Team rules в dashboard для общих стандартов.

### Поведение

- Автоматически на каждое обновление PR (настраивается в dashboard).
- Вручную: комментарий `cursor review` или `bugbot run` в PR.
- Check в GitHub: **`Cursor Bugbot`**.

### Branch protection (опционально)

- Добавить required check **`Cursor Bugbot`**, если хотите гарантировать запуск ревью.
- По умолчанию findings дают conclusion **`neutral`**, merge не блокируется. Чтобы блокировать merge при нерешённых замечаниях, включите fail-on-unresolved в настройках команды в Bugbot dashboard.

### Billing

Bugbot — usage-based. Нужна подписка Bugbot / Bugbot Teams. Секрет `CURSOR_API_KEY` в Actions **не нужен** — Bugbot работает через GitHub App.

## Проверка после настройки

1. Открыть тестовый PR.
2. Убедиться, что job **`quality`** в Actions зелёный.
3. Убедиться, что появился check **`Cursor Bugbot`** и комментарии в diff.
4. При необходимости — `@cursor remember …` в комментарии PR для learned rules.
