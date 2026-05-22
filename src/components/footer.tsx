import { ArrowRightIcon } from "lucide-react";

import { AnimatedWordmark } from "@/components/brand/animated-wordmark";

const footerLinks = [
  { title: "Docs", href: "/docs" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Repositories", href: "/repositories" },
  { title: "Reviews", href: "/dashboard/reviews" },
  { title: "Security", href: "/dashboard/security" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div>
          <AnimatedWordmark />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            AI code reviews, repository indexing, webhook trust, and security posture
            in one developer-focused control surface.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              className="group flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
            >
              {link.title}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Copyright {new Date().getFullYear()} Rabbit Stack. All rights reserved.
      </div>
    </footer>
  );
}
