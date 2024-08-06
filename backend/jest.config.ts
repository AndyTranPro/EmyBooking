import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  globalSetup: "./populate.ts",
  verbose: true,
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
