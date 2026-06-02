# PSSE Website Project

## Project Overview
This repository contains the full-stack web application for the **Philippine Society of Software Engineers (PSSE)**. It is organized as a monorepo containing a modern React frontend and a NestJS backend.

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS 4, React Router 6.
- **Backend:** NestJS, Prisma ORM, PostgreSQL.
- **Testing:** Jest (backend), Vitest/Playwright/MSW/Storybook (frontend).

---

## Building and Running

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Cloudinary (for image storage)
- Resend (for email notifications)

### Development Setup
Each application requires its own environment configuration (`.env`). Copy `.env.example` to `.env` in both `psse-backend` and `psse-react` directories and configure the necessary variables.

#### Backend (`/psse-backend`)
1. `npm install`
2. `npx prisma migrate dev`
3. `npm run start:dev` (runs at `http://localhost:3000`)

#### Frontend (`/psse-react`)
1. `npm install`
2. `npm run dev` (runs at `http://localhost:5173`)

---

## Development Conventions
- **Language:** Strictly TypeScript throughout both frontend and backend.
- **Styling:** Tailwind CSS is used for all UI components.
- **Testing:** 
    - Backend: Jest for Unit and Integration tests.
    - Frontend: Vitest/Playwright for component tests, MSW for API mocking, Storybook for visual development.
- **Architecture:** 
    - Frontend follows a modular structure (`components/common`, `components/features`, `pages`).
    - Backend follows standard NestJS layered architecture (Controllers, Services, Modules).
- **Database:** Prisma ORM for database interactions and migrations.

---

## Useful Commands

### Backend (`/psse-backend`)
- `npm run start:dev`: Start development server (hot-reload).
- `npm run test:unit`: Run Jest unit tests.
- `npm run test:integration`: Run Jest integration tests.
- `npx prisma migrate dev`: Apply database migrations.
- `npx prisma studio`: Open Prisma database browser.

### Frontend (`/psse-react`)
- `npm run dev`: Start Vite development server.
- `npm run build`: Production build.
- `npm run storybook`: Run Storybook.
- `npm run lint`: Run ESLint.
