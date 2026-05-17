-- CreateTable
CREATE TABLE "dependencyAudit" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'npm',
    "total" INTEGER NOT NULL DEFAULT 0,
    "critical" INTEGER NOT NULL DEFAULT 0,
    "high" INTEGER NOT NULL DEFAULT 0,
    "moderate" INTEGER NOT NULL DEFAULT 0,
    "low" INTEGER NOT NULL DEFAULT 0,
    "info" INTEGER NOT NULL DEFAULT 0,
    "fixable" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dependencyAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dependencyAudit_source_idx" ON "dependencyAudit"("source");

-- CreateIndex
CREATE INDEX "dependencyAudit_createdAt_idx" ON "dependencyAudit"("createdAt");
