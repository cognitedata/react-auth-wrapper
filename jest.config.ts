export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 30000,
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['src/**'],
    modulePathIgnorePatterns: [
        'lib',
        'src/index.ts',
        'src/interfaces',
        'src/utils/utils.json',
        'src/core/openid/endpoints.json',
        'src/__tests__/__mocks__',
    ],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageThreshold: {
        global: {
            lines: 95,
        },
    },
};
