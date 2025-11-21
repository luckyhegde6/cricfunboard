// jest.config.ts
import type { Config } from "@jest/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: Config.InitialOptions = {
    preset: "ts-jest",
    // keep default env for UI tests, but we will mark server tests with node when needed
    testEnvironment: "jest-environment-jsdom",
    roots: ["<rootDir>/tests/unit"],
    setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "^bson$": require.resolve("bson"),
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.(mjs|js|jsx)$": "babel-jest",
    },
    // <-- IMPORTANT: allow transforming all node_modules. This avoids brittle allowlists.
    transformIgnorePatterns: [],
    testTimeout: 20000,
    // keep TS files treated normally
    extensionsToTreatAsEsm: [".ts", ".tsx"],
};

export default config;
