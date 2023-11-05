export default {
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
            // any other ts-jest specific settings
        }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    // other configurations as needed
};