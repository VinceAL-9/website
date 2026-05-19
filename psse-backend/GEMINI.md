# PSSE Backend API

This directory contains the backend for the Philippine Society of Software Engineers (PSSE) website. It is a RESTful API built with NestJS, providing data services and business logic for the frontend application.

## Project Overview

- **Framework:** NestJS 11
- **Database:** PostgreSQL (designed for Neon.tech)
- **ORM:** Prisma
- **Authentication:** Passport.js with JWT (Access and Refresh tokens)
- **API Documentation:** Swagger / OpenAPI
- **Media Storage:** Cloudinary
- **Email Service:** Nodemailer (configured for Resend)

## Directory Structure

- `src/`: Main source code directory.
  - `auth/`: Authentication logic, JWT strategies, and guards.
  - `events/`: Event management module.
  - `officers/`: Officer management module.
  - `products/`: Merchandise and product catalog module.
  - `orders/`: Order processing and management.
  - `prisma/`: Prisma service integration for dependency injection.
  - `mail/`: Email sending service and templates.
  - `cloudinary/`: Image upload service.
- `prisma/`: Database schema definitions (`schema.prisma`) and migrations.
  - `schema.prisma`: The single source of truth for the database schema.
  - `migrations/`: Auto-generated SQL migrations.
- `tests/`: Test suites configuration and implementation.

## Setup and Environment

1.  **Dependencies:** Run `npm install` to install all required packages.
2.  **Environment Variables:** Copy `.env.example` to `.env` and fill in the required values. Key variables include:
    - `DATABASE_URL` / `DIRECT_URL`: PostgreSQL connection strings.
    - `JWT_SECRET` / `JWT_REFRESH_SECRET`: Secrets for signing tokens.
    - `CLOUDINARY_*`: Cloudinary API credentials for image uploads.
    - `MAIL_*`: SMTP configuration for sending emails.

## Common Commands

- **Start Development Server:** `npm run start:dev` (Runs on `http://localhost:3000` by default).
- **Build for Production:** `npm run build`
- **Lint Code:** `npm run lint`
- **Format Code:** `npm run format` (Uses Prettier).
- **Run Unit Tests:** `npm run test:unit`
- **Run Integration Tests:** `npm run test:integration`

### Prisma Commands

- **Generate Prisma Client:** `npm run prisma:generate`
- **Create a Migration:** `npm run prisma:migrate:dev`
- **Push Schema:** `npm run prisma:push`
- **Open Prisma Studio:** `npm run prisma:studio`

## Development Conventions

- **Validation:** Use `class-validator` and `class-transformer` decorators on DTOs. The application uses a global `ValidationPipe` to enforce these rules automatically.
- **Documentation:** Use `@nestjs/swagger` decorators on controllers and DTOs to keep the OpenAPI documentation up-to-date. The Swagger UI is available at `/api` when the server is running.
- **Security:** Endpoints requiring authentication should be protected with the `@UseGuards(JwtAuthGuard)` decorator. Role-based access control can be implemented using custom roles guards.
- **Error Handling:** Avoid returning raw errors. Use standard NestJS `HttpException` classes (e.g., `NotFoundException`, `BadRequestException`).
