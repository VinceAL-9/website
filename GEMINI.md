# PSSE Organization Website

This repository contains the full-stack codebase for the Philippine Society of Software Engineers (PSSE) website. It is structured as a monorepo with separate frontend and backend directories.

## Project Architecture

### Frontend (`/psse-react`)
A modern web application built with React, TypeScript, Vite, and Tailwind CSS.

**Key Technologies:**
- **React 19** with functional components and hooks
- **Vite** for fast build tooling and development server
- **Tailwind CSS v4** for utility-first styling
- **React Router v7** for client-side routing
- **React Hook Form & Zod** for form state management and validation
- **Axios** for API communication

**Directory Structure:**
- `src/components/`: Reusable UI components organized by `common`, `features`, and `layout`.
- `src/pages/`: Main route components (Home, About, Events, Merchandise, Admin/User dashboards).
- `src/context/`: React Context providers for global state (e.g., UserAuth, Orders).
- `src/services/`: API integration layer.

**Running the Frontend:**
```bash
cd psse-react
npm install
npm run dev
```

### Backend (`/psse-backend`)
A progressive Node.js server built with the NestJS framework and Prisma ORM.

**Key Technologies:**
- **NestJS 11** for a modular, scalable backend architecture
- **Prisma ORM** with PostgreSQL (`@prisma/adapter-pg`)
- **Passport & JWT** for authentication and authorization
- **Swagger** for API documentation
- **Cloudinary** for image uploading
- **Nodemailer** with Handlebars for email sending

**Directory Structure:**
- `src/auth/`: Authentication logic, strategies, and guards.
- `src/users/`, `src/products/`, `src/orders/`, `src/events/`, `src/officers/`: Domain-specific modules with controllers and services.
- `src/prisma/`: Prisma service integration.
- `prisma/`: Prisma schema definition and migration files.

**Running the Backend:**
```bash
cd psse-backend
npm install
npm run start:dev
```

## Development Conventions

1. **Language:** TypeScript is used across both frontend and backend for end-to-end type safety. Ensure strict typing and avoid `any` wherever possible.
2. **Package Management:** Both projects use `npm`. Ensure you are installing dependencies in the correct subdirectory.
3. **Formatting & Linting:** 
   - Backend: Uses Prettier and ESLint (`npm run format`, `npm run lint`).
   - Frontend: Uses ESLint (`npm run lint`).
4. **Environment Variables:** Both projects require their own `.env` files. Refer to `.env.example` in each directory for required variables (e.g., Database URLs, JWT secrets, Cloudinary credentials).
5. **Database Migrations:** When making schema changes in Prisma (`psse-backend/prisma/schema.prisma`), run `npx prisma migrate dev` to generate and apply migrations locally.