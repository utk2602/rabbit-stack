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

## Review Rules

Connected repositories can define review behavior in the app UI. Teams can also
commit repository-local rules in one of these files:

- `.rabbitstack.yml`
- `.rabbitstack.yaml`
- `.github/rabbitstack.yml`
- `.github/rabbitstack.yaml`

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
