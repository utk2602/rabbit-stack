# Rabbit Stack UI Overhaul Plan

## North Star

Rabbit Stack should feel like an AI code-review command center for developers: fast, precise, technical, trustworthy, and memorable. React Bits should provide the motion language and visual signature, while the product UI stays calm enough for repeated daily use.

The theme direction is **"living code radar"**:

- Dark, high-contrast product surface.
- Electric green, cyan, and violet accents for AI, status, and scanning states.
- Sharp engineering UI with 6-8px radii, compact spacing, and strong hierarchy.
- Animated backgrounds and text effects on marketing/auth pages.
- Subtle motion, hover glow, progressive reveal, and live status indicators inside the app.

## Design Principles

1. Product pages should optimize scanning over decoration.
2. React Bits components should be used where motion adds identity, feedback, or orientation.
3. Dashboards should use dense, predictable layouts with restrained animation.
4. Every screen needs loading, empty, error, and connected states.
5. Mobile should feel intentionally designed, not just stacked desktop cards.
6. Components should be copied into the repo and themed locally, not treated as black boxes.

## Visual System

### Color Direction

Replace the current cream/brown dominant palette with a cooler developer-focused system:

- Background: near-black charcoal, not pure black.
- Surface: layered graphite panels.
- Border: low-contrast zinc/graphite with active neon accents.
- Primary: electric green or mint for successful review/AI-ready states.
- Secondary accent: cyan for indexing, scanning, and repository sync.
- Tertiary accent: violet for AI summaries and generated insights.
- Warning: amber.
- Danger: red.

Suggested token direction:

```css
--background: #090b0f;
--foreground: #f4f7fb;
--card: #10141c;
--muted: #171c26;
--muted-foreground: #8d98aa;
--border: #222a36;
--primary: #7cf7c8;
--primary-foreground: #06110d;
--accent: #14263a;
--ring: #7cf7c8;
--chart-1: #7cf7c8;
--chart-2: #5bd8ff;
--chart-3: #a78bfa;
--chart-4: #fbbf24;
--chart-5: #fb7185;
```

### Typography

- Keep Azurio only where it strengthens brand expression.
- Use a clean sans stack for dense dashboard content.
- Use mono text for PR numbers, file paths, branches, tokens, and status metadata.
- Avoid oversized dashboard headings; reserve large type for the landing hero.

### Shape And Layout

- App cards: 8px radius maximum.
- Buttons: 6px radius.
- Sidebar: compact, persistent, keyboard-friendly.
- Page width: wider for operational pages, narrower only for review detail reading.
- Avoid cards inside cards unless the inner element is a repeated row, modal, or tool.

## React Bits Integration Strategy

Use the TypeScript + Tailwind variants where possible.

Install/copy components into:

```text
src/components/react-bits/
```

Create Rabbit Stack wrappers in:

```text
src/components/brand/
```

Likely wrappers:

- `RabbitAurora`
- `CodeRadarBackground`
- `AnimatedWordmark`
- `GlowPanel`
- `ReviewSignal`
- `ScanLine`
- `StatusPulse`

### Candidate React Bits Components

Use these categories intentionally:

- Backgrounds: Aurora, Dot Field, Shape Grid, Line Waves, Beams.
- Text: Shiny Text, Split Text, Scramble Text, Blur Text.
- UI/interaction: Magnet, Dock, Glare Card, Spotlight Card, Flowing Menu.
- Effects: Pixel Trail, Magic Rings, Metallic Paint, Splash Cursor.

Avoid heavy cursor effects or WebGL backgrounds on authenticated dashboard pages unless performance is verified.

## Information Architecture

### Public

- `/` Marketing page
- `/login` Auth page
- `/docs` Documentation

### Authenticated App

- `/dashboard` Overview
- `/repositories` Repository connections and settings
- `/dashboard/reviews` Review activity
- `/dashboard/security` Security center

## Page-by-Page Design

### Landing Page

Goal: make Rabbit Stack immediately feel like an AI reviewer for pull requests.

Design:

- Full-bleed React Bits animated background.
- Hero headline: "Rabbit Stack" or "AI Code Reviews For Every Pull Request".
- Supporting copy focused on GitHub PR automation.
- Animated code-review preview, not a generic dashboard screenshot.
- CTA pair: "Connect GitHub" and "View Docs".
- Product proof section: review comments, repo indexing, webhook health, security checks.
- Short workflow section: connect repo, open PR, receive review.
- Footer becomes clean and product-focused.

React Bits usage:

- Aurora or Beams background.
- Shiny/Scramble headline accent.
- Spotlight/Glare cards for feature proof.
- Subtle animated grid behind product preview.

### Login Page

Goal: make GitHub auth feel secure and intentional.

Design:

- Left visual panel with animated repository graph or scanning background.
- Right compact auth form.
- Clear GitHub OAuth explanation.
- Security trust notes: no passwords, GitHub OAuth, encrypted API key storage.

React Bits usage:

- Line Waves or Dot Field on the left panel.
- Shiny Text for small "GitHub OAuth" label.
- Soft background motion only.

### App Shell

Goal: make the app feel like a real operating system for code review.

Design:

- Sidebar with logo, nav, active route, user footer, collapse.
- Add top page header area inside each route.
- Use icons consistently.
- Add mobile bottom/slide navigation.
- Keep shell motion subtle: active nav glow, hover transition, maybe magnetic controls.

Components to build:

- `AppShell`
- `AppSidebar`
- `AppMobileNav`
- `PageHeader`
- `PageToolbar`

### Dashboard

Goal: answer "what needs my attention?" in five seconds.

Design:

- Top summary: AI reviewer status, connected repos, open review jobs, failed jobs.
- Metrics row with compact cards.
- Main left column: review activity graph and recent reviews.
- Right column: next actions, system health, GitHub connection.
- Replace decorative gradients with status-driven visual hierarchy.

React Bits usage:

- Animated status pulse for "AI reviewer active".
- Small scan-line/GlowPanel treatment for system health.
- Avoid large animated backgrounds.

### Repositories

Goal: make connecting and configuring repos efficient.

Design:

- Header with total, connected, indexed, failed.
- Search and filters as a stable toolbar.
- Repository cards become dense rows/cards with clear actions:
  - Connect/disconnect
  - Review settings
  - Reindex
  - Webhook/indexing status
- Modal becomes a polished settings panel with segmented controls and toggles.

React Bits usage:

- Subtle Glare/Spotlight hover on connected cards.
- StatusPulse for indexing states.
- No distracting background animation.

### Review Activity

Goal: make AI reviews easy to scan, inspect, and retry.

Design:

- Status tabs: All, Completed, Running, Failed.
- Search toolbar.
- Timeline/list layout for reviews.
- Expanded detail should feel like a review report:
  - Summary
  - Issues
  - Suggestions
  - Inline comments
  - GitHub link
  - Retry action for failed reviews
- Better handling for long branch names and file paths.

React Bits usage:

- Animated reveal for expanding review detail.
- Subtle glow on failed/retry-needed cards.
- Shiny labels only for AI-generated sections, used sparingly.

### Security Center

Goal: make operational risk obvious.

Design:

- Header posture score/status.
- Risk cards grouped by category:
  - Secrets
  - Webhooks
  - Reviews
  - Indexing
  - Dependencies
  - Audit events
- Recent events as a table/timeline.
- Recommended actions as an actionable checklist.

React Bits usage:

- Radar or scan motif in the header.
- Pulse indicators for good/warn/bad.
- Keep the content static and readable.

### Docs

Goal: make setup understandable.

Design:

- Sidebar/table of contents.
- Quick start cards.
- API/auth details.
- GitHub setup, webhook setup, OpenAI key setup.
- Use mono blocks and callouts.

React Bits usage:

- Minimal. Docs should be clear first.

## Shared Components To Build

Create these before full page rewrites:

- `PageHeader`
- `MetricCard`
- `StatusBadge`
- `StatusPulse`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `Toolbar`
- `SearchInput`
- `SegmentedControl`
- `GlowPanel`
- `RepoStatusRow`
- `ReviewReport`
- `RiskCard`

## Implementation Phases

### Phase 1: Foundation

- Update color tokens in `src/app/globals.css`.
- Create shared layout/components.
- Add React Bits folder structure.
- Install/copy first 2-3 React Bits components.
- Verify lint/build.

### Phase 2: App Shell

- Redesign sidebar and authenticated layout.
- Add mobile app navigation.
- Standardize page headers/toolbars.

### Phase 3: Core App Pages

- Redesign dashboard.
- Redesign repositories.
- Redesign review activity.
- Redesign security center.

### Phase 4: Public Pages

- Redesign landing page with React Bits visual identity.
- Redesign login page.
- Polish docs.

### Phase 5: QA And Polish

- Check desktop/tablet/mobile.
- Check auth and unauthenticated states.
- Check empty/error/loading states.
- Verify long repository names, branch names, and file paths.
- Run lint and build.
- Performance check heavy React Bits components.

## Suggested Commit Sequence

```text
1. docs: add ui overhaul blueprint
2. style: update design tokens and base app surfaces
3. feat: add shared ui overhaul components
4. feat: add React Bits themed wrappers
5. feat: redesign app shell navigation
6. feat: redesign dashboard
7. feat: redesign repositories
8. feat: redesign review activity
9. feat: redesign security center
10. feat: redesign landing and auth pages
11. chore: responsive polish and final QA
```

## Definition Of Done

The overhaul is complete when:

- All public and authenticated pages share one visual system.
- React Bits is visible as a theme, not random decoration.
- App pages remain fast and readable.
- Mobile layouts are polished.
- Empty/loading/error states are designed.
- `npm run lint` passes.
- `npm run build` passes.
- The app has been manually checked on common viewport sizes.

