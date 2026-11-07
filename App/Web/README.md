# AREA Web

Comprehensive web dashboard for AREA — a platform to manage areas, services, users and service connections. Built with Next.js, TypeScript and React, AREA Web provides an admin interface for creating and configuring areas, viewing area runs and logs, managing users and services, and handling authentication flows.

This repository contains the frontend of the AREA platform. It is primarily aimed at internal teams and operators who need to administer AREA resources and inspect runtime data.

## Key features

- Responsive Next.js (App Router) TypeScript application.
- Authentication, login, logout, password reset and OAuth callback flows.
- Area management: create, edit and view areas and their configured services.
- Service management: list services and configure service connections and tokens.
- Dashboard and metrics: area run tables, logs, stats cards and charts.
- User management: user list, roles and profile pages.
- Mock data and tests: unit tests with Jest and E2E tests with Cypress; test mocks included.
- Docker-ready for local development and production deployment.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Jest for unit/component tests
- Cypress for end-to-end tests
- ESLint and Prettier for linting and formatting
- Yarn (v1/v2 compatible) for package management

## Repository layout (important folders)

- `app/` - Next.js app directory (routes and pages using the App Router)
- `components/` - Reusable UI components (area editor, lists, tables, forms)
- `services/` - API service wrappers (authService, areasService, userService,...)
- `config/` - API configuration and axios clients (`config/api.ts`, `config/axios.ts`)
- `mocks/` - Local mock data used in development and tests
- `cypress/` - Cypress E2E tests and fixtures
- `__tests__/` - Jest unit/integration tests and mocks
- `docs/` - Project documentation (setup, testing strategy, contributing)

## Quick start — Local development

Prerequisites:

- Node.js (LTS recommended)
- Yarn

1) Install dependencies

```bash
yarn install
```

2) Create environment variables

Copy or create an `.env.local` file in the project root and set any required variables (the project uses a client-side axios configuration in `config/axios.ts` and may read API base URLs from the environment). Example:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

3) Start the development server

```bash
yarn dev
```

Open http://localhost:3000 in your browser.

Notes:

- The app uses Next.js App Router under `app/`. Pages are server components by default; inspect files like `app/page.tsx` and route folders for individual pages (login, areas, dashboard, etc.).
- Mock data available in `src/mocks/` and `cypress/fixtures/` helps for UI development without a backend.

## Testing

Unit and component tests use Jest. E2E tests use Cypress.

Run Jest tests:

```bash
yarn test
```

Run Cypress (open interactive GUI):

```bash
yarn cypress:open
```

Run Cypress headless:

```bash
yarn cypress:run
```

If your CI uses a different command, check the `package.json` scripts for exact targets. Tests rely on mock fixtures in `__tests__/` and `cypress/fixtures/`.

## Linting & Formatting

Run ESLint:

```bash
yarn lint
```

Run Prettier (if configured):

```bash
yarn format
```

## Docker

This project contains Dockerfiles and docker-compose configurations for local development and production.

To build and run the development image (example):

```bash
# build (from repository root)
docker compose -f Docker/docker-compose.yml build
# start
docker compose -f Docker/docker-compose.yml up
```

Or use the top-level `docker-compose.yml`/`docker-compose.prod.yml` when appropriate. See the `Docker/` folder for helper Dockerfiles and README.

## CI / CD

Project contains docs about CI pipeline in `docs/ci-pipeline.md`. Configure your CI system to run lint, tests and build steps. Typical pipeline steps:

- Install dependencies
- Run lint
- Run unit tests
- Run E2E tests (optional, require services)
- Build static assets and run production build (`yarn build`)

## Contributing

We welcome contributions. Please follow these guidelines:

1. Read `docs/development-setup.md` and `docs/how-to-contribute.md` for code standards and branch strategy.
2. Create a feature branch from `main` and open a pull request with a clear title and description.
3. Add or update tests for new features and run the test suite locally.
4. Keep changes small and focused. Ensure linting and type checks pass.

For documentation updates, edit files in `docs/` and include links in the PR description.

## Troubleshooting

See `docs/troubleshooting.md` for common issues. A few tips:

- If the dev server fails to start, check `node` and `yarn` versions.
- If API requests fail, ensure `NEXT_PUBLIC_API_BASE_URL` points to the correct backend and CORS settings allow the frontend.

## Useful files

- `app/` — main Next.js routes and pages
- `components/ui/areaCreation/AreaEditor.tsx` — area editor toolset
- `config/axios.ts` — axios client used throughout services
- `src/test-setup.ts` — test setup for Jest

## License

See the `LICENSE` file in repository root.

## Contact

If you have questions or need help, open an issue in the repository or contact the maintainers listed in the project settings.

