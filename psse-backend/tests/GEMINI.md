# PSSE Backend Testing

This directory contains the testing suite for the PSSE backend.

## Testing Architecture

The project uses [Jest](https://jestjs.io/) for both unit and integration testing.

- `unit/`: Contains isolated tests for individual services.
- `integration/`: Contains tests that interact with the database and other services (e.g., mail, Cloudinary).

## Configuration

- `jest.config.ts`: Defines two separate test projects: `unit` and `integration`.
- `integration/setup.ts`: Global setup for integration tests, including loading `.env.test` and initializing database cleanup.

## Running Tests

From the `psse-backend` root directory:

- **Run all tests:** `npm run test`
- **Run Integration tests:** `npm run test:integration`
- **Run Unit tests:** `npm run test:unit`

## Adding Tests

1.  **Unit Tests:** Place in `tests/unit/` using the `.spec.ts` suffix.
2.  **Integration Tests:** Place in `tests/integration/` using the `.test.ts` suffix. 
    - Ensure you utilize `tests/integration/helpers/` for database and app setup to ensure tests are isolated and idempotent.
    - If your test requires a specific database state, use the helpers to seed or clear the database before/after tests.
