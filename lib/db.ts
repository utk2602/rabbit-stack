import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { encryptSecret, isEncryptedSecret } from "./secrets";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const ACCOUNT_SECRET_FIELDS = [
  "accessToken",
  "refreshToken",
  "idToken",
  "password",
] as const;

type MutableRecord = Record<string, unknown>;

function encryptFieldValue(value: unknown): unknown {
  if (typeof value === "string") {
    return isEncryptedSecret(value) ? value : encryptSecret(value);
  }

  if (value && typeof value === "object" && "set" in value) {
    const valueRecord = value as MutableRecord;
    if (typeof valueRecord.set === "string") {
      return {
        ...valueRecord,
        set: isEncryptedSecret(valueRecord.set)
          ? valueRecord.set
          : encryptSecret(valueRecord.set),
      };
    }
  }

  return value;
}

function encryptAccountSecretFields<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => encryptAccountSecretFields(item)) as T;
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  const nextData: MutableRecord = { ...(data as MutableRecord) };

  for (const field of ACCOUNT_SECRET_FIELDS) {
    if (nextData[field] !== undefined && nextData[field] !== null) {
      nextData[field] = encryptFieldValue(nextData[field]);
    }
  }

  return nextData as T;
}

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter }).$extends({
    query: {
      account: {
        async create({ args, query }) {
          args.data = encryptAccountSecretFields(args.data);
          return query(args);
        },
        async createMany({ args, query }) {
          args.data = encryptAccountSecretFields(args.data);
          return query(args);
        },
        async update({ args, query }) {
          args.data = encryptAccountSecretFields(args.data);
          return query(args);
        },
        async updateMany({ args, query }) {
          args.data = encryptAccountSecretFields(args.data);
          return query(args);
        },
        async upsert({ args, query }) {
          args.create = encryptAccountSecretFields(args.create);
          args.update = encryptAccountSecretFields(args.update);
          return query(args);
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
export const db = prisma;
