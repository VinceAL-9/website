# PSSE Backend Tests

## Overview
This directory contains the testing suite for the `psse-backend` application. It follows a structure separating unit tests from integration tests and provides shared helpers and mocks.

## Structure
- `unit/`: Contains Jest unit tests for services.
- `integration/`: Contains Jest integration tests for controllers, including setup and database cleanup.
- `mocks/`: Reusable mocks (e.g., Cloudinary, Mail).
- `helpers/`: Shared testing utilities (`auth-helper`, `db-cleaner`, `test-app`).

## Testing Conventions
- **Framework:** Jest.
- **Configuration:** `jest.config.ts` in this directory handles the test environment configuration and defines separate projects for unit and integration tests.
- **Integration Tests:** Use `tests/integration/setup.ts` for global setup. Database state is managed using `tests/integration/helpers/db-cleaner.ts`.

## Running Tests
Refer to the `psse-backend` root `GEMINI.md` for test runner commands (`npm run test:unit`, `npm run test:integration`).
