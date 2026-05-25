# PSSE Organization Website - Frontend (`/psse-react`)

This directory contains the modern React-based frontend for the Philippine Society of Software Engineers (PSSE) website. It interacts with a separate backend API and provides a user-friendly interface for organization members and guests.

## Project Architecture & Tech Stack

This is a modern React Single Page Application (SPA) built with performance and developer experience in mind.

*   **Core:** React 19 (functional components and hooks) with TypeScript for end-to-end type safety.
*   **Build Tooling:** Vite 8 for fast development server and optimized production builds.
*   **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin).
*   **Routing:** React Router v7 (`react-router-dom`).
*   **Forms & Validation:** React Hook Form (`react-hook-form`) coupled with Zod (`zod`).
*   **Data Fetching:** Axios.
*   **UI Components:** Component-driven development architecture.
*   **Mocking:** MSW (Mock Service Worker) for mocking API requests.

### Directory Structure

*   `src/components/`: Reusable UI components.
    *   `common/`: Generic UI elements (Button, Badge, Card, Modal).
    *   `features/`: Domain-specific components (OfficerCard, EventCard).
    *   `layout/`: Structural layout components (Navbar, Footer, PageLayout).
*   `src/pages/`: Main application routes (Home, About, Events, Merchandise).
*   `src/context/`: React Context providers for global state management.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and library configurations (e.g., Axios setup).
*   `src/services/`: API integration layer.
*   `src/types/`: TypeScript interface and type definitions.
*   `.storybook/`: Storybook configuration.

## Building and Running

Ensure you are in the `psse-react` directory before running these commands.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Testing & Quality Assurance

The project heavily utilizes Storybook and Vitest for testing and component isolation.

```bash
# Run ESLint to analyze code quality
npm run lint

# Start Storybook for component development and manual testing
npm run storybook

# Build Storybook static files
npm run build-storybook

# Run all pre-deployment checks (Linting, Storybook build, Application build)
npm run all-prechecks
```

*Note: The project is configured with `@storybook/addon-vitest` to run tests on stories using Vitest and Playwright (Chromium).*

## Development Conventions

1.  **TypeScript First:** Use strict TypeScript. Define interfaces and types in `src/types/` or within the relevant component files.
2.  **Path Aliasing:** Use the `@` alias to import from the `src` directory (e.g., `import Button from '@/components/common/Button'`).
3.  **Styling:** Utilize Tailwind CSS utility classes. Avoid writing custom CSS unless absolutely necessary (which would go in `src/index.css`).
4.  **Component Driven Development:** Create `.stories.tsx` files alongside your components (e.g., `Button.tsx` and `Button.stories.tsx`) to document and test UI states in isolation.
5.  **Linting:** The project uses an ESLint flat config (`eslint.config.js`). Ensure code passes `npm run lint` before committing.
6.  **Mocking:** Leverage MSW for development without a live backend or for isolated component testing in Storybook.
