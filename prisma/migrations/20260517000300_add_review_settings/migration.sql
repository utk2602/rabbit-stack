-- CreateTable
CREATE TABLE "repositoryReviewSettings" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'balanced',
    "minimumSeverityToPost" TEXT NOT NULL DEFAULT 'warning',
    "customRules" TEXT,
    "useRepositoryRules" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositoryReviewSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repositoryReviewSettings_repositoryId_key" ON "repositoryReviewSettings"("repositoryId");

-- CreateIndex
CREATE INDEX "repositoryReviewSettings_mode_idx" ON "repositoryReviewSettings"("mode");

-- AddForeignKey
ALTER TABLE "repositoryReviewSettings" ADD CONSTRAINT "repositoryReviewSettings_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
