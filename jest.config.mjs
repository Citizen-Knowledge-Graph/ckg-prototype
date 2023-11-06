export default {
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.jest.json'}],
        "^.+\\.jsx?$": "babel-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/(?!rdf-ext|@rdfjs|nodeify-fetch|node-fetch|data-uri-to-buffer|fetch-blob|" +
        "formdata-polyfill|is-stream|grapoi|rdf-validate-shacl|clownface|@vocabulary|" +
        "rdf-validate-datatype|@tpluscode|@zazuko|duplex-to|get-stream).+\\.js$"
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};