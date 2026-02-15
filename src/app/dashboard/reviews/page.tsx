import { requireAuth } from "../../../../lib/auth-utils";
import { db } from "../../../../lib/db";
import { ReviewActivityClient } from "./ReviewActivityClient";

export const metadata = {
  title: "Review Activity | Rabbit Stack",
  description: "View your AI code review history",
};

export default async function ReviewsPage() {
  const session = await requireAuth();

  const reviews = await db.pullRequestReview.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    include: {
      repository: {
        select: {
          fullName: true,
          name: true,
        },
      },
      comments: {
        select: {
          id: true,
          path: true,
          line: true,
          body: true,
          severity: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return <ReviewActivityClient reviews={JSON.parse(JSON.stringify(reviews))} />;
}
