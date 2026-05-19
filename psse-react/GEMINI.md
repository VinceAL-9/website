# PSSE Website Frontend (psse-react)

## Project Overview

This directory contains the frontend application for the **Philippine Society of Software Engineers (PSSE)** website. It is a modern, single-page web application designed with a responsive, mobile-first approach.

**Key Technologies:**
- **React 19** - UI library with functional components and hooks
- **TypeScript** - For end-to-end type safety
- **Vite** - Fast build tooling and development server
- **Tailwind CSS v4** - Utility-first styling framework
- **React Router v7** - Client-side routing
- **React Hook Form & Zod** - Form state management and schema validation
- **Axios** - For API communication with the backend

## Directory Structure

The project follows a modular structure inside the `src/` directory:

- `components/` - Reusable UI components, organized into:
  - `common/` - Generic UI elements (Buttons, Cards, Modals, Badges).
  - `features/` - Domain-specific components (EventCards, OfficerCards, CheckoutModals).
  - `layout/` - Structural components (Navbar, Footer, PageLayout).
- `pages/` - Main route components, including public views (Home, About, Events, Merchandise) and dashboard views (admin/, user/).
- `context/` - React Context providers for global state (e.g., `UserAuthContext`, `OrderContext`).
- `data/` - Static fallback or initial data.
- `hooks/` - Custom React hooks (e.g., `useScrollAnimation`).
- `lib/` - Utility functions and configured library instances (e.g., Axios instance).
- `services/` - API integration and communication layer (`api.ts`).
- `types/` - Shared TypeScript interfaces and type definitions.

**Note:** The `@` alias is configured to point to the `src/` directory (e.g., `import { Button } from '@/components/common/Button'`).

## Building and Running

Commands are run using `npm`:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Run ESLint to check for code issues
npm run lint

# Preview the production build locally
npm run preview
```

## Development Conventions

1. **TypeScript & Types:** Ensure strict typing across the application. Avoid using `any`. Place shared types in `src/types/`.
2. **Styling:** Use Tailwind CSS utility classes for styling. Global styles and Tailwind configuration are located in `src/index.css` and `vite.config.ts`.
3. **State Management:** Use local state (useState, useReducer) for component-level state and React Context for global state (auth, cart/orders).
4. **Form Handling:** Forms should be implemented using `react-hook-form` and validated using `zod` schemas.
5. **API Calls:** Use the configured Axios instance in `src/lib/axios.ts` or services in `src/services/` for API requests.
6. **Linting:** Code must pass ESLint checks (`npm run lint`). Standard React hooks rules and TypeScript guidelines apply.
