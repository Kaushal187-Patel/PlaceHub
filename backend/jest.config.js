module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  // Keep unit tests fast and isolated; integration tests that need a live
  // PostgreSQL run separately (see docs/audit/06_TESTING_PLAN.md).
  setupFiles: ['<rootDir>/tests/setupEnv.js']
};
