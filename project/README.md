# Brix

Brix is a collaborative project-management application built with the Next.js App Router. It combines team-based access control, project and task management, an interactive Kanban board, calendar views, analytics, notifications, and responsive light/dark interfaces.

This repository is an individual internship capstone implementation. The application is deployed on Vercel at [brix-pm-app.vercel.app](https://brix-pm-app.vercel.app/).

## Features

- Clerk authentication, protected application routes, and user synchronization to Neon
- Team creation, member management, and owner/admin/member permissions
- Team-scoped project creation and project collaborator management
- Project, list, task, label, and comment operations
- Drag-and-drop task and column ordering with dnd-kit
- Optimistic Kanban state with Zustand and persistent server updates
- Task assignment, priorities, due dates, labels, comments, and activity history
- Project and task search, filters, pagination, and bulk task operations
- Dashboard metrics, team-scoped analytics, and project activity
- Month, week, and day calendar views with project and task deadlines
- In-app notifications for collaboration events
- Responsive layouts, loading skeletons, accessible status pages, and light/dark themes
- Vitest unit/component tests and Playwright end-to-end workflows

> Board changes are persisted immediately and optimistically in the initiating browser. Brix does not currently broadcast changes live to other open browsers through WebSockets.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript |
| Authentication | Clerk |
| Database | Neon PostgreSQL |
| ORM and migrations | Drizzle ORM and Drizzle Kit |
| Validation | Zod |
| Client state | Zustand |
| Drag and drop | dnd-kit |
| UI | Tailwind CSS 4, Shadcn/UI, Radix UI, Lucide React |
| Unit/component testing | Vitest |
| End-to-end testing | Playwright |
| Deployment | Vercel |

## Architecture

Brix uses Server Components by default. Route-level Server Components authenticate users, query Neon, and prepare data before passing it into focused Client Components for interactions such as dialogs, filters, optimistic state, and drag-and-drop.

```text
project/
├── app/
│   ├── (auth)/                 # Clerk sign-in and sign-up routes
│   ├── (dashboard)/            # Protected application routes and Server Actions
│   └── api/webhooks/clerk/     # Verified Clerk synchronization webhook
├── components/
│   ├── analytics/              # Analytics cards and scope controls
│   ├── calendar/               # Calendar views, toolbar, events, and deadlines
│   ├── dashboard/              # Metrics, quick actions, and recent projects
│   ├── kanban/                 # Board, columns, bulk actions, and DnD hooks
│   ├── project/                # Project cards, forms, labels, and collaborators
│   ├── task/                   # Task cards, forms, actions, and discussion
│   ├── team/                   # Team cards, details, and member controls
│   └── ui/                     # Shared Shadcn/UI primitives
├── lib/
│   ├── auth/                   # Current-user lookup and Clerk synchronization
│   ├── calendar/               # Date and calendar utilities
│   └── db/
│       ├── mutations/          # Authorized database writes
│       ├── queries/            # Database reads and computed metrics
│       └── schema.ts           # Drizzle tables, enums, relations, and types
├── stores/                     # Zustand board and UI stores
├── drizzle/                    # Generated SQL migrations
├── styles/                     # Global styles and semantic design tokens
└── tests/
    ├── unit/                   # Validation, store, utility, and component tests
    └── e2e/                    # Auth, project, task, and Kanban workflows
```

### Data flow

```text
Server Component or Client form
        ↓
Server Action
        ↓
Zod validation and Clerk authentication
        ↓
Authorization check
        ↓
Drizzle query or mutation
        ↓
Neon PostgreSQL
        ↓
Path revalidation and updated UI
```

Multi-step writes that must succeed together use PostgreSQL transactions through the Neon WebSocket driver. Ordinary reads and single writes use the Neon HTTP driver.

## Authorization Model

Every project belongs to a team. A user must own or administer a team before creating a project under it, and a project collaborator must first belong to that team.

| Role | Main capabilities |
| --- | --- |
| Owner | Full team control, role management, project management, and destructive owner actions |
| Admin | Team member and project collaboration management within defined restrictions |
| Member | Access and collaboration on authorized projects and tasks |

Authorization is enforced in server-side queries and mutations.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm 10.10.0
- A Clerk application
- A Neon PostgreSQL database

### Installation

```bash
git clone <repository-url>
cd nextjs-internship-capstone/project
pnpm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure these values in `.env.local`:

```dotenv
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SIGNING_SECRET=

# Existing dedicated Clerk test user used by authenticated Playwright tests
E2E_CLERK_USER_EMAIL=
```

Apply the existing database migrations and start the application:

```bash
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Clerk Webhook

Create a Clerk webhook endpoint targeting:

```text
https://<your-domain>/api/webhooks/clerk
```

Subscribe to:

- `user.created`
- `user.updated`
- `user.deleted`

Store the endpoint signing secret as `CLERK_WEBHOOK_SIGNING_SECRET`. The route verifies webhook signatures before synchronizing user data.

For local webhook testing, expose the application through a secure tunnel and use its HTTPS URL as the Clerk endpoint.

## Database and Migrations

The schema is defined in `lib/db/schema.ts`. When the schema changes:

```bash
pnpm db:generate
pnpm db:migrate
```

Review generated SQL before applying it. To inspect data through Drizzle Studio:

```bash
pnpm db:studio
```

Do not manually alter Drizzle migration history after a migration has been applied to a shared or production database.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm check` | Run Biome checks |
| `pnpm format` | Format files with Biome |
| `pnpm type-check` | Run TypeScript without emitting files |
| `pnpm test` | Run the Vitest suite |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm db:generate` | Generate a timestamped Drizzle migration |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Testing

Run the static and automated checks:

```bash
pnpm check
pnpm type-check
pnpm test
pnpm build
```

Install the Playwright browser once, then run E2E tests:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Authenticated E2E tests require `E2E_CLERK_USER_EMAIL` to reference an existing dedicated Clerk test user. That user must own or administer at least one disposable team. Tests use unique data and should not rely on data created by another test.

## Deployment

The Vercel project must use:

- **Framework preset:** Next.js
- **Root directory:** `project`
- **Build command:** `pnpm build`
- **Output directory:** leave empty
- **Install command:** `pnpm install`

Add the same production environment variables listed above and configure the Clerk webhook with the deployed `/api/webhooks/clerk` URL. Deployments using Clerk development keys will display Clerk's expected development-instance warning.

## Current Limitations and Future Hardening

- **No multi-browser live synchronization:** persisted board changes appear to other already-open browsers after refresh.
- **Single team owner:** each team has one definitive owner; multiple owners are not supported.
- **No ownership transfer yet:** deleting a Clerk account soft-deletes the synchronized Neon user, but owned teams and projects retain that user reference. Explicit transfer and automatic succession are future lifecycle hardening.
- **No team deletion action yet:** physical team deletion would set related `projects.teamId` values to `null`; the application does not expose this operation. A future action should archive the team and its projects transactionally.
- **Basic in-app notifications:** notifications are stored and shown in Brix; email delivery and scheduled due-date reminders are not implemented.

These limitations do not affect the documented core project, task, Kanban, collaboration, testing, and deployment workflows, but they should be addressed before treating Brix as a commercial multi-tenant product.

## Reference Documentation

- [Next.js](https://nextjs.org/docs)
- [Clerk](https://clerk.com/docs)
- [Neon](https://neon.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [dnd-kit](https://docs.dndkit.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
