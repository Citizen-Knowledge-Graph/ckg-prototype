// Import the necessary modules
import { loadToShapes } from '../../src/validator'; // Replace with your actual module name
import storage from '../../src/storage';
// @ts-ignore
import rdf from 'rdf-ext';

jest.mock('../../src/storage', () => ({
    getInstance: jest.fn().mockReturnValue({
        loadFile: jest.fn().mockImplementation((filepath: string) => {
        }),
    }),
}));

describe('loadToShapes', () => {
    it('should load data from a file and return an RDF dataset', async () => {
        // Arrange
        const filepath = './test/resources/empty.ttl';
        const expectedDataset = rdf.dataset();

        // Act
        const result = await loadToShapes(filepath);

        // Assert
        expect(result).toEqual(expectedDataset);
        // You can add more assertions here to validate specific aspects of the RDF dataset
    });
});
