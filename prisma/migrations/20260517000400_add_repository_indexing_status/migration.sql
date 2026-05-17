ALTER TABLE "repository"
ADD COLUMN "indexingStatus" TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN "lastIndexedAt" TIMESTAMP(3),
ADD COLUMN "lastIndexError" TEXT,
ADD COLUMN "indexedFileCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "indexedChunkCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "repository_indexingStatus_idx" ON "repository"("indexingStatus");
