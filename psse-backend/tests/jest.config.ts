import type { Config } from 'jest';

const baseConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],

  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: { outDir: './dist-test', rootDir: '..' } },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
  },
};

const config: Config = {
  rootDir: './',
  collectCoverageFrom: ['<rootDir>/../src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
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
