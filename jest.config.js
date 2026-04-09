const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/(layout|loading|error|not-found).tsx',
  ],
  coverageThreshold: {
    global: { branches: 40, functions: 40, lines: 50 },
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/'],
}

module.exports = createJestConfig(config)
