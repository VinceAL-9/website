import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { clearDatabase, closeDatabase } from './helpers/db-cleaner';

// Setup file to orchestrate global integration state
beforeAll(async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // Ensure a clean database before running integration tests.
  // This prevents unique-constraint failures on re-runs when a
  // previous test session didn't tear down properly.
  await clearDatabase();
});

afterAll(async () => {
  // Clean up global database state after each test suite
  await clearDatabase();
  await closeDatabase();
  jest.restoreAllMocks();
});
