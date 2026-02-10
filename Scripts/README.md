# Scripts Folder

This folder contains test and utility scripts for the Rabbit Stack application.

## Available Scripts

### test-webhook.ts
Tests the webhook endpoint by simulating GitHub webhook payloads.

```bash
npx tsx Scripts/test-webhook.ts
```

### test-ai-review.ts
Tests the AI code review functionality with a sample diff.

```bash
npx tsx Scripts/test-ai-review.ts
```

### test-db.ts
Tests database connection and Prisma queries.

```bash
npx tsx Scripts/test-db.ts
```

## Environment Requirements

Make sure you have the following environment variables set:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI API key for Gemini
- `PINECONE_DB_API_KEY` - Pinecone API key
- `WEBHOOK_URL` - Public URL for webhook testing (e.g., ngrok URL)

## Running Tests

All scripts can be run using `tsx`:

```bash
# Install tsx globally if not already installed
npm install -g tsx

# Or run via npx
npx tsx Scripts/<script-name>.ts
```
