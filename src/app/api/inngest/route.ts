import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { indexRepo, reviewPullRequest } from "../../../../inngest/functions/index";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    reviewPullRequest,
  ],
});