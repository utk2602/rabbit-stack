import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t bg-[radial-gradient(35%_128px_at_50%_0%,--theme(--color-foreground/.08),transparent)]">
			<div className="relative mx-auto max-w-5xl px-4">
				<div className="relative grid grid-cols-1 border-x md:grid-cols-4 md:divide-x">
					<div>
						<SocialCard className="border-t-0" href="https://github.com" title="GitHub" />
						<LinksGroup
							links={[
								{ title: "Pull Request Reviews", href: "/docs" },
								{ title: "IDE Reviews", href: "/docs" },
								{ title: "CLI Reviews", href: "/docs" },
								{ title: "Pricing", href: "#" },
								{ title: "Blog", href: "#" },
							]}
							title="Products"
						/>
					</div>
					<div>
						<SocialCard href="https://www.instagram.com/utkxrshh__.__" title="Instagram" />
						<LinksGroup
							links={[
								{ title: "Dashboard", href: "/dashboard" },
								{ title: "Repositories", href: "/repositories" },
								{ title: "Reviews", href: "/dashboard/reviews" },
								{ title: "Documentation", href: "/docs" },
								{ title: "FAQ", href: "#" },
							]}
							title="Navigation"
						/>
					</div>

					<div>
						<SocialCard href="https://x.com/utkarshhhhhhh26" title="Twitter" />
						<LinksGroup
							links={[
								{ title: "Help Center", href: "#" },
								{ title: "Terms of Service", href: "#" },
								{ title: "Privacy Policy", href: "#" },
								{ title: "Security", href: "#" },
								{ title: "Changelog", href: "#" },
							]}
							title="Support"
						/>
					</div>
					<div>
						<SocialCard href="mailto:workutkarshkashyap@gmail.com" title="Email" />
						<LinksGroup
							links={[
								{ title: "About Us", href: "#" },
								{ title: "Careers", href: "#" },
								{ title: "Contact", href: "mailto:workutkarshkashyap@gmail.com" },
								{ title: "Partners", href: "#" },
								{ title: "Legal", href: "#" },
							]}
							title="Company"
						/>
					</div>
				</div>
			</div>
			<div className="flex justify-center border-t p-3">
				<p className="text-muted-foreground text-xs">
					&copy; {new Date().getFullYear()} Rabbit Stack Inc. All rights reserved
				</p>
			</div>
		</footer>
	);
}

type LinksGroupProps = {
	title: string;
	links: { title: string; href: string }[];
};
function LinksGroup({ title, links }: LinksGroupProps) {
	return (
		<div className="p-2">
			<h3 className="mt-2 mb-4 font-medium text-foreground/75 text-xs uppercase tracking-wider">
				{title}
			</h3>
			<ul>
				{links.map((link) => (
					<li key={link.title}>
						<a
							className="text-muted-foreground text-xs hover:text-foreground"
							href={link.href}
						>
							{link.title}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

function SocialCard({
	title,
	href,
	className,
}: React.ComponentProps<"a"> & {
	title: string;
}) {
	return (
		<a
			className={cn(
				"flex items-center justify-between border-y p-2 text-sm hover:bg-muted md:border-t-0 dark:hover:bg-muted/50",
				className
			)}
			href={href}
		>
			<span className="font-medium">{title}</span>
			<ArrowRightIcon className="size-4" />
		</a>
	);
}
