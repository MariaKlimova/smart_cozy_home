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
4. **Не** добавлять **`Cursor Bugbot`** в required checks (см. ниже — cloud Bugbot сейчас выключен).

## Cursor Bugbot (AI-ревью PR) — **временно выключен**

> Cloud Bugbot **не входит** в workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
> Check `Cursor Bugbot` на PR приходит от GitHub App Cursor, а не от GitHub Actions.

Правила ревью по-прежнему в [`.cursor/BUGBOT.md`](../.cursor/BUGBOT.md) — их использует локальный subagent
[Code Review](../.cursor/agents/code-review.md) (`/code-review`).

### Как выключить на PR (один раз в dashboard)

1. [Bugbot dashboard](https://cursor.com/dashboard/bugbot) → репозиторий `MariaKlimova/smart_cozy_home`.
2. Переключатель **Off** (или `enabled: false` через [Admin API](https://cursor.com/docs/bugbot#enabling-or-disabling-repositories)).
3. GitHub → **Settings** → **Branches** → если в protection есть **`Cursor Bugbot`**, убрать из required checks.

После этого на PR остаётся только job **`quality`** из Actions.

### Включить обратно

1. [Integrations → GitHub](https://cursor.com/docs/integrations/github) — GitHub App установлен.
2. [Bugbot dashboard](https://cursor.com/dashboard/bugbot) — включить репозиторий.
3. (Опционально) Team rules в dashboard, required check в branch protection.

### Поведение (когда включён)

- Автоматически на каждое обновление PR (настраивается в dashboard).
- Вручную: комментарий `cursor review` или `bugbot run` в PR.
- Check в GitHub: **`Cursor Bugbot`**.

### Billing

Bugbot — usage-based. Секрет `CURSOR_API_KEY` в Actions **не нужен** — Bugbot работает через GitHub App.

## Проверка CI

1. Открыть тестовый PR.
2. Убедиться, что job **`quality`** в Actions зелёный.
3. Check **`Cursor Bugbot`** на PR **не должен** появляться, пока Bugbot выключен в dashboard.
