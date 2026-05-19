import type { Config } from 'jest';

const baseConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './tests',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: { outDir: './dist-test', rootDir: '..' } },
    ],
  },
  collectCoverageFrom: ['../src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
  },
};

const config: Config = {
  projects: [
    {
      ...baseConfig,
      displayName: 'unit',
      testMatch: ['<rootDir>/unit/**/*.spec.ts'],
    },
    {
      ...baseConfig,
      displayName: 'integration',
      testMatch: ['<rootDir>/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/integration/setup.ts'],
      maxWorkers: 1,
    },
  ],
};

export default config;
