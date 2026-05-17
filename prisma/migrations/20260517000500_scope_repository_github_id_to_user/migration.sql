DROP INDEX IF EXISTS "repository_githubId_key";

CREATE UNIQUE INDEX "repository_userId_githubId_key" ON "repository"("userId", "githubId");
