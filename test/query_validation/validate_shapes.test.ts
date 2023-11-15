import { loadToShapes, createProfileReport } from '../../src/validator'; // Replace with your actual module name
// @ts-ignore
import rdf from 'rdf-ext';

describe('createProfileReport should create correct reports for citizen-solar-funding', () => {
    const queryFilePath = './db/queries/citizen-solar-funding.ttl'
    let query: rdf.Dataset;

    beforeEach(async () => {
        query = await loadToShapes(queryFilePath);
    });

    it('should validate a user profile against SHACL shapes successfully', async () => {
        // Example of reading Turtle file for user profile
        const testProfilePath = './test/resources/citizen-solar-funding/valid_profile.ttl'
        const profile = await loadToShapes(testProfilePath);

        // Perform the validation
        const validationReport = await createProfileReport(query, profile);

        // Assertions based on expected outcomes
        expect(validationReport.conforms).toEqual(true);
    });

    it('should validate a user profile against SHACL shapes unsuccessfully', async () => {
        // Example of reading Turtle file for user profile
        const testProfilePath = './test/resources/citizen-solar-funding/invalid_profile.ttl'
        const profile = await loadToShapes(testProfilePath);

        // Perform the validation
        const validationReport = await createProfileReport(query, profile);

        // Assertions based on expected outcomes
        expect(validationReport.conforms).toEqual(false);
    });
});