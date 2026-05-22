import {
  Bot,
  CheckCircle2,
  Database,
  GitPullRequest,
  KeyRound,
  RadioTower,
  ShieldCheck,
  Webhook,
} from "lucide-react";

const workflow = [
  {
    icon: GitPullRequest,
    title: "Open or update a pull request",
    text: "GitHub sends Rabbit Stack a pull request event for connected repositories.",
  },
  {
    icon: Webhook,
    title: "Verify the webhook",
    text: "The webhook signature is checked before any review job is queued.",
  },
  {
    icon: Database,
    title: "Load codebase context",
    text: "Repository indexing and embeddings help the reviewer understand more than the diff.",
  },
  {
    icon: Bot,
    title: "Post focused feedback",
    text: "Rabbit Stack returns a review summary and inline comments directly on the PR.",
  },
];

const setup = [
  "Sign in with GitHub OAuth.",
  "Connect the repositories you want Rabbit Stack to watch.",
  "Add the OpenAI key used for embeddings and configure server provider keys.",
  "Open a pull request and check Review Activity for the generated report.",
];

const env = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "WEBHOOK_URL",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "OPENAI_API_KEY",
  "PINECONE_DB_API_KEY",
  "DATA_ENCRYPTION_KEY",
];

export function DocsSection() {
  return (
    <section id="docs" className="scroll-mt-24 border-t border-border bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-primary">Documentation</p>
          <h2 className="text-3xl font-semibold tracking-normal md:text-4xl">
            Setup notes that live where people actually need them.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
            Rabbit Stack is a GitHub-connected AI reviewer. Use this guide to connect
            repositories, understand the review pipeline, and configure the environment
            needed for production reviews.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="mb-5 flex items-center gap-2">
              <RadioTower className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">How reviews run</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-lg border border-border bg-background/50 p-4">
                    <Icon className="mb-3 h-5 w-5 text-primary" />
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Quick setup</h3>
              </div>
              <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
                {setup.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Security model</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>GitHub OAuth handles sign-in. Rabbit Stack does not store passwords.</p>
                <p>Webhook signatures are verified before review jobs are accepted.</p>
                <p>API keys should be encrypted with <code>DATA_ENCRYPTION_KEY</code>.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Environment checklist</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {env.map((key) => (
              <code
                key={key}
                className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground"
              >
                {key}
              </code>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

