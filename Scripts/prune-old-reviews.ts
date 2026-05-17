import { db } from "../lib/db";

const DEFAULT_RETENTION_DAYS = 90;

function retentionDate() {
  const rawDays = Number(process.env.REVIEW_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS);
  const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : DEFAULT_RETENTION_DAYS;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return { days, cutoff };
}

async function main() {
  const { days, cutoff } = retentionDate();

  const result = await db.pullRequestReview.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  console.log(`Pruned ${result.count} pull request reviews older than ${days} days.`);
}

main()
  .catch((error) => {
    console.error("Failed to prune old reviews:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
