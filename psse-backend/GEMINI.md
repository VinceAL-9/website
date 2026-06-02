# PSSE Backend

## Overview
This is the NestJS backend application for the PSSE organization website. It uses PostgreSQL managed by Prisma ORM and interacts with Cloudinary for image storage and Nodemailer for emails.

## Development Setup
- **Scripts:**
    - `npm run start:dev`: Start development server with hot-reload.
    - `npm run test`: Run all tests (Unit & Integration).
    - `npm run test:unit`: Run only unit tests.
    - `npm run test:integration`: Run only integration tests.
    - `npm run prisma:migrate:dev`: Run database migrations.
    - `npm run prisma:studio`: Open Prisma Studio to inspect the database.

## Architecture & Conventions
- **Framework:** NestJS (Modules, Controllers, Services).
- **ORM:** Prisma.
- **Database:** PostgreSQL.
- **Validation:** `class-validator` for DTOs.
- **Testing:** Jest.
    - Unit tests: Located in `tests/unit`.
    - Integration tests: Located in `tests/integration`.
- **Styling/Formatting:** Prettier and ESLint are enforced. Run `npm run lint` and `npm run format`.

## Database
The schema is defined in `prisma/schema.prisma`. All changes to the database structure should be made there and applied via `npm run prisma:migrate:dev`.
