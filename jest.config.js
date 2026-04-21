/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.env.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  testMatch: [
    "<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/app/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/components/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/components/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/lib/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/lib/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server-only$": "<rootDir>/lib/testing/__mocks__/server-only.ts",
    "^next/server$": "<rootDir>/lib/testing/__mocks__/next-server.ts",
    "\\.(css|scss|sass)$": "<rootDir>/lib/testing/__mocks__/style.ts"
  },

  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/__tests__/**",
    "!**/testing/**",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],

  transform: {
    "^.+\\.(js|jsx|ts|tsx|mts|mjs)$": ["babel-jest", { presets: ["next/babel"] }]
  },

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/.worktrees/",
    "/__tests__/helpers/",
    "<rootDir>/lib/testing/"
  ],

  modulePathIgnorePatterns: ["<rootDir>/.worktrees/"],
  transformIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "mts", "js", "jsx", "mjs", "json"],
  clearMocks: true,
  verbose: true,
  forceExit: true,
  maxWorkers: 1
};

module.exports = config;
