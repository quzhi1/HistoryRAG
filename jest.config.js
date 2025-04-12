/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    '^.+\\.m?js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^nanoid$': '<rootDir>/node_modules/nanoid/nanoid.js',
    '^node:crypto$': '<rootDir>/node_modules/crypto-browserify/index.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid|clsx|tailwind-merge|@ai-sdk)/)'
  ],
  extensionsToTreatAsEsm: ['.ts'],
}; 