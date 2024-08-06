module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
  collectCoverageFrom: [
    './src/pages/Register.tsx',
    './src/components/FilterModal.tsx',
    './src/components/NotificationSettingsModal.tsx',
    './src/components/ResponsiveAppBar.tsx',
    './src/pages/Login.tsx',
    './src/pages/Contact.tsx',
    './src/pages/Dashboard.tsx',
  ]
};