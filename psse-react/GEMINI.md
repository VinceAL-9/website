# PSSE React Frontend

## Project Overview
The React frontend for the PSSE website.
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7.
- **Testing/Dev:** Vitest, Playwright, MSW, Storybook.

## Development Conventions
- **Language:** Strictly TypeScript.
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite`).
- **Architecture:** Modular structure in `src/` (`components/common`, `components/features`, `pages`, `context`, `hooks`, `services`).
- **Testing:** 
  - Components: Vitest + React Testing Library (implicit, check `vitest` config).
  - Visual: Storybook.
  - Integration: Playwright.
  - API Mocking: MSW (handlers in `.storybook/msw-handlers.ts`).

## Useful Commands
- `npm run dev`: Start development server.
- `npm run build`: Production build.
- `npm run lint`: Run ESLint.
- `npm run storybook`: Run Storybook.
- `npm run all-prechecks`: Run lint, storybook build, and production build.
