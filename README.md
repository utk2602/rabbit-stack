# Rabbit Stack

Rabbit Stack is a self-hosted AI code-review platform for GitHub repositories.
It signs users in with GitHub OAuth, listens to GitHub webhooks, indexes safe
repository context, and posts structured pull request reviews back to GitHub.

The app is built for teams that want fast review feedback without handing every
piece of source code to a SaaS product by default. Secrets are encrypted,
webhooks are verified, indexing avoids sensitive files, and raw code snippets in
Pinecone are opt-in.

## Features

- GitHub OAuth-only sign-in with JWT support through Better Auth.
- Short-lived JWT access tokens at `/api/auth/token` and JWKS at `/api/auth/jwks`.
- GitHub repository sync, connect, disconnect, webhook creation, and manual reindexing.
- Fail-closed GitHub webhook signature verification.
- AI pull request reviews with overview, walkthrough, suggestions, issues, inline comments, and GitHub posting.
- Per-repository review profiles for mode, minimum posted severity, custom rules, and repository rule files.
- Repository-local rules from `.rabbitstack.yml`, `.rabbitstack.yaml`, `.github/rabbitstack.yml`, or `.github/rabbitstack.yaml`.
- Codebase indexing with sensitive-file filters for env files, credentials, generated output, dependency folders, binaries, lockfiles, and oversized files.
- Pinecone vector context with raw code metadata disabled unless explicitly enabled.
- Security dashboard for encrypted secrets, webhook health, indexing health, review failures, dependency risk, and recent audit events.
- Dependency audit ingestion, security events API, health endpoint, review retry, review retention cleanup, rate limiting, same-origin checks, and security headers.

## Tech Stack

- Next.js App Router and React
- TypeScript
- PostgreSQL with Prisma
- Better Auth with GitHub OAuth and JWT plugin
- GitHub REST and GraphQL APIs through Octokit
- Inngest background jobs
- OpenAI embeddings
- Pinecone vector database
- Google Gemini via AI SDK
- Tailwind CSS

## Architecture

1. A user signs in with GitHub OAuth.
2. Better Auth stores the GitHub account token and can issue a short-lived JWT.
3. The user connects a GitHub repository.
4. Rabbit Stack verifies repository metadata with GitHub and creates a webhook.
5. A repository indexing job fetches safe source files, chunks them, embeds them, and stores vectors in Pinecone.
6. GitHub sends pull request webhooks to `/api/webhooks/github`.
7. The webhook handler verifies the HMAC signature and queues a review job in Inngest.
8. The review job fetches PR details, gets relevant vector context, applies repository review settings, generates review output, stores it, and posts it to GitHub.
9. Security, audit, dependency, webhook, and indexing status are surfaced in the dashboard.

## Authentication

Rabbit Stack intentionally supports only:

- GitHub OAuth for user sign-in.
- JWT issuance for authenticated API access.

Email/password, Google, Apple, magic link, and other authentication methods are not enabled.

Relevant endpoints:

- `/api/auth/sign-in/social` for GitHub OAuth through the Better Auth client.
- `/api/auth/token` to issue a short-lived JWT for an authenticated session.
- `/api/auth/jwks` to expose public keys for JWT verification.
- `/api/auth/sign-out` for logout through the Better Auth client.

GitHub OAuth requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. The app requests `read:user`, `user:email`, and `repo` scopes so it can read repositories, create webhooks, and post reviews.

## Environment

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Important variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: long random secret for Better Auth.
- `BETTER_AUTH_URL`: app URL used by auth callbacks. In production this must be HTTPS, for example `https://rabbit-stack.vercel.app`.
- `NEXT_PUBLIC_BETTER_AUTH_URL`: public auth base URL for the client. Use the same HTTPS origin in production.
- `GITHUB_CLIENT_ID`: GitHub OAuth app client id.
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret.
- `DATA_ENCRYPTION_KEY`: recommended base64-encoded 32-byte key for secret encryption. If omitted, Rabbit Stack derives a stable fallback key from `BETTER_AUTH_SECRET`.
- `WEBHOOK_URL`: public HTTPS URL GitHub can call.
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API key for reviews.
- `PINECONE_API_KEY`: Pinecone API key.
- `PINECONE_INDEX_NAME`: Pinecone index name.
- `PINECONE_STORE_CODE_SNIPPETS`: set to `true` only if you want raw code snippets in vector metadata.
- `REVIEW_RETENTION_DAYS`: retention window used by `npm run reviews:prune`.

Generate `DATA_ENCRYPTION_KEY` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Validate security environment:

```bash
npm run security:env
```

Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

For local webhook testing, use a public tunnel and set `WEBHOOK_URL` to that tunnel URL. `ALLOW_LOCAL_WEBHOOK_BYPASS=true` is available only for development flows where webhook delivery is not required.

## Review Rules

Repository owners can configure review settings in the Repositories UI. Teams can also commit repository-local rules:

```yaml
review:
  focus:
    - authorization and access control
    - database migrations and retention
    - webhook verification and secret handling
  ignore:
    - generated files
    - formatting-only diffs
```

Supported paths:

- `.rabbitstack.yml`
- `.rabbitstack.yaml`
- `.github/rabbitstack.yml`
- `.github/rabbitstack.yaml`

## Security Model

- OpenAI keys, GitHub tokens, and webhook secrets are encrypted before storage.
- GitHub webhook payloads are verified with HMAC SHA-256 and fail closed.
- Mutation routes use same-origin checks and rate limits.
- Next.js security headers include frame protection, content sniffing protection, referrer policy, permissions policy, CSP, and production HSTS.
- Indexing skips obvious secrets, generated files, vendored folders, lockfiles, binaries, and oversized files.
- Pinecone stores content hashes by default, not raw source snippets.
- Audit events record sensitive operations such as repository connections, webhook failures, review failures, reindex requests, and settings changes.
- `/api/health` checks the app, database, and encryption key configuration.

## Scripts

- `npm run dev`: start the development server.
- `npm run build`: build the production app.
- `npm run start`: run the production server.
- `npm run lint`: run ESLint.
- `npm run security:env`: validate required security environment variables.
- `npm run security:check`: run release-oriented Prisma, TypeScript, and security checks.
- `npm run backfill:secrets`: encrypt legacy plaintext secrets.
- `npm run audit:ingest`: ingest the latest npm audit summary into the database.
- `npm run reviews:prune`: delete old pull request review records using `REVIEW_RETENTION_DAYS`.

## Operational Endpoints

- `GET /api/health`: app health and core dependency checks.
- `GET /api/security/summary`: authenticated security dashboard summary.
- `GET /api/security/events`: authenticated audit event feed.
- `GET /api/security/dependencies`: authenticated dependency audit summary.
- `POST /api/repositories/:repositoryId/reindex`: queue a repository reindex.
- `POST /api/reviews/:reviewId/retry`: retry a failed review.

## Deployment

Before deploying:

```bash
npm run security:check
npx prisma migrate deploy
npm run build
```

Production checklist:

- Configure a GitHub OAuth app callback for `${BETTER_AUTH_URL}/api/auth/callback/github`.
  For Vercel this should look like `https://rabbit-stack.vercel.app/api/auth/callback/github`, not `http://...`.
- Set `WEBHOOK_URL` to the public HTTPS app URL.
- Set `DATA_ENCRYPTION_KEY` and keep it stable across deployments, or keep `BETTER_AUTH_SECRET` stable if you rely on the fallback key.
- Run `npm run backfill:secrets` if migrating existing plaintext data.
- Run `npm run audit:ingest` after dependency audits.
- Schedule `npm run reviews:prune` if you want bounded review retention.

## Notes

This repository contains generated Prisma output under ignored paths. Regenerate it with `npx prisma generate` after schema changes.
