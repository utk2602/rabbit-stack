

import "dotenv/config";
import { db } from "../lib/db";
import { encryptSecret, isEncryptedSecret } from "../lib/secrets";

function encryptLegacyValue(value: string | null): string | null {
  if (!value || isEncryptedSecret(value)) {
    return value;
  }

  return encryptSecret(value);
}

async function backfillAccountSecrets() {
  const accounts = await db.account.findMany({
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      idToken: true,
      password: true,
    },
  });

  let updated = 0;

  for (const account of accounts) {
    const data = {
      accessToken: encryptLegacyValue(account.accessToken),
      refreshToken: encryptLegacyValue(account.refreshToken),
      idToken: encryptLegacyValue(account.idToken),
      password: encryptLegacyValue(account.password),
    };

    const changed =
      data.accessToken !== account.accessToken ||
      data.refreshToken !== account.refreshToken ||
      data.idToken !== account.idToken ||
      data.password !== account.password;

    if (!changed) {
      continue;
    }

    await db.account.update({
      where: { id: account.id },
      data,
    });
    updated++;
  }

  return updated;
}

async function backfillRepositorySecrets() {
  const repositories = await db.repository.findMany({
    select: {
      id: true,
      webhookSecret: true,
    },
  });

  let updated = 0;

  for (const repository of repositories) {
    const webhookSecret = encryptLegacyValue(repository.webhookSecret);

    if (webhookSecret === repository.webhookSecret) {
      continue;
    }

    await db.repository.update({
      where: { id: repository.id },
      data: { webhookSecret },
    });
    updated++;
  }

  return updated;
}

async function backfillSettingsSecrets() {
  const settingsRows = await db.settings.findMany({
    select: {
      id: true,
      openaiApiKey: true,
    },
  });

  let updated = 0;

  for (const settings of settingsRows) {
    const openaiApiKey = encryptLegacyValue(settings.openaiApiKey);

    if (openaiApiKey === settings.openaiApiKey) {
      continue;
    }

    await db.settings.update({
      where: { id: settings.id },
      data: { openaiApiKey },
    });
    updated++;
  }

  return updated;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!process.env.DATA_ENCRYPTION_KEY) {
    throw new Error("DATA_ENCRYPTION_KEY is required");
  }

  const [accounts, repositories, settings] = await Promise.all([
    backfillAccountSecrets(),
    backfillRepositorySecrets(),
    backfillSettingsSecrets(),
  ]);

  console.log("Secret backfill complete");
  console.log(`Accounts updated: ${accounts}`);
  console.log(`Repositories updated: ${repositories}`);
  console.log(`Settings rows updated: ${settings}`);
}

main()
  .catch((error) => {
    console.error("Secret backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
