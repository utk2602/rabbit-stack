-- AlterTable
ALTER TABLE "repository" ADD COLUMN "lastWebhookDeliveryId" TEXT,
ADD COLUMN "lastWebhookEvent" TEXT,
ADD COLUMN "lastWebhookStatus" TEXT,
ADD COLUMN "lastWebhookError" TEXT,
ADD COLUMN "lastWebhookAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "repository_lastWebhookStatus_idx" ON "repository"("lastWebhookStatus");
