# Rabbit Stack

Rabbit Stack connects GitHub repositories, indexes code for AI review context,
and posts pull request reviews through GitHub webhooks.

## Getting Started

Install dependencies and prepare your environment:

```bash
npm install
cp .env.example .env
npm run security:env
npx prisma migrate deploy
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Setup

- Set `DATA_ENCRYPTION_KEY` before storing tokens or OpenAI keys. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- Run `npm run backfill:secrets` after adding encryption to an existing database.
- Set `WEBHOOK_URL` to a public HTTPS app URL in production. Local webhook bypass is only for development.
- Leave `PINECONE_STORE_CODE_SNIPPETS=false` unless you intentionally want raw code snippets stored in Pinecone metadata.
- Run `npm run audit:ingest` after dependency audits so the security dashboard shows current dependency risk.
- Run `npm run reviews:prune` on a schedule to remove old stored review payloads. Tune with `REVIEW_RETENTION_DAYS`.

## What Was Added

- Encrypted storage for OpenAI keys, GitHub account tokens, and webhook secrets.
- Fail-closed GitHub webhook verification with health tracking and audit events.
- Security dashboard for secret hygiene, webhook health, indexing health, dependency risk, and recent audit events.
- Dependency audit ingestion with historical storage.
- Review profiles per repository with mode, minimum posted severity, custom rules, and repo-local rules files.
- Sensitive-file indexing filters for env files, credentials, generated output, dependency folders, binaries, lockfiles, and oversized files.
- Pinecone metadata privacy: raw code snippets are opt-in with `PINECONE_STORE_CODE_SNIPPETS=true`.
- Repository indexing lifecycle tracking, manual reindex controls, and health reporting.
- Retry controls for failed pull request reviews.
- Same-origin and rate-limit protections on sensitive mutation routes.
- Security headers, health checks, retention cleanup, and release checklist scripts.

## Review Rules

Connected repositories can define review behavior in the app UI. Teams can also
commit repository-local rules in one of these files:

- `.rabbitstack.yml`
- `.rabbitstack.yaml`
- `.github/rabbitstack.yml`
- `.github/rabbitstack.yaml`

Example:

```yaml
review:
  focus:
    - security-sensitive authorization changes
    - database migrations and data retention
  ignore:
    - generated files
    - cosmetic formatting-only diffs
```

## Useful Scripts

- `npm run dev` starts the Next.js app.
- `npm run build` creates a production build.
- `npm run security:env` validates required security environment variables.
- `npm run security:check` runs release-oriented security and type checks.
- `npm run backfill:secrets` encrypts legacy plaintext secrets.
- `npm run audit:ingest` stores the latest npm audit result for the dashboard.
- `npm run reviews:prune` deletes review records older than the configured retention window.

## Deployment

Before deploying, run `npm run security:check`, `npx prisma migrate deploy`, and
`npm run build`.
