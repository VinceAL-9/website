# PSSE Organization Website

## Project Overview
This repository contains the full-stack codebase for the Philippine Society of Software Engineers (PSSE) website. It is structured as a monorepo containing both a React frontend and a NestJS backend.

**Main Technologies:**
- **Frontend (`/psse-react`)**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7, React Hook Form, Zod, and Axios.
- **Backend (`/psse-backend`)**: NestJS 11, TypeScript, Prisma ORM, PostgreSQL, Passport.js (JWT), Swagger, Cloudinary, and Nodemailer.

**Architecture:**
The application uses a decoupled client-server architecture. The frontend is a modern Single Page Application (SPA) that communicates with the backend via a RESTful API. The backend handles business logic, database interactions, authentication, and external service integrations (like Cloudinary for images and Resend for emails).

## Building and Running

### Prerequisites
- Node.js (v18 or higher) and npm
- PostgreSQL (local or cloud like Neon.tech)
- Cloudinary account (for image uploads)
- Resend account (optional, for emails)

### Backend Setup (`/psse-backend`)
1. **Install Dependencies:**
   ```bash
   cd psse-backend
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env` and configure `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, and `MAIL_*`.
3. **Database Setup:**
   ```bash
   npx prisma migrate dev
   ```
4. **Key Commands:**
   - **Start Dev Server:** `npm run start:dev` (http://localhost:3000)
   - **Build:** `npm run build`
   - **Unit Tests:** `npm run test:unit`
   - **Integration Tests:** `npm run test:integration`
   - **Format Code:** `npm run format`
   - **Lint Code:** `npm run lint`
   - **Prisma Studio:** `npm run prisma:studio`

### Frontend Setup (`/psse-react`)
1. **Install Dependencies:**
   ```bash
   cd psse-react
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env`. `VITE_API_URL` should point to the backend (default: `http://localhost:3000/`).
3. **Key Commands:**
   - **Start Dev Server:** `npm run dev` (http://localhost:5173)
   - **Build:** `npm run build`
   - **Preview Build:** `npm run preview`
   - **Lint Code:** `npm run lint`
   - **Start Storybook:** `npm run storybook`
   - **Pre-deployment Checks:** `npm run all-prechecks`

## Development Conventions

- **Language:** TypeScript is strictly used across both frontend and backend for end-to-end type safety. Avoid using `any`.
- **Package Management:** Use `npm` and ensure commands are run in their respective subdirectories (`/psse-react` or `/psse-backend`).
- **Code Style & Formatting:** 
  - Backend uses Prettier and ESLint.
  - Frontend uses an ESLint flat config. 
  - Ensure all code passes linting before committing.
- **Component-Driven Development:** The frontend utilizes Storybook to develop and test UI components in isolation (create `.stories.tsx` alongside components).
- **Backend Architecture:** Follows the standard NestJS modular architecture (Controllers, Services, Modules). DTOs must be validated using `class-validator` and `class-transformer`.
- **API Documentation:** The backend uses `@nestjs/swagger` decorators to maintain live OpenAPI documentation accessible at `/api`.
- **Testing Practices:** 
  - Backend relies on Jest for both isolated unit tests and full-flow integration tests.
  - Frontend relies on Storybook coupled with Vitest, Playwright, and Mock Service Worker (MSW) for testing components.