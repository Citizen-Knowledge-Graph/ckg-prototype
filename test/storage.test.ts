import storage from '../src/storage'; // replace with your actual import path
import fs from 'fs';
// @ts-ignore
import {Parser as N3Parser} from 'n3';
//import path from 'path';
import {Readable} from 'stream';

jest.mock('fs', () => ({
    createReadStream: jest.fn(),
}));

jest.mock('n3', () => {
    const actualN3 = jest.requireActual('n3');
    return {
        ...actualN3,
        Parser: jest.fn()
    }
});

jest.mock('@comunica/query-sparql-rdfjs', () => ({
    QueryEngine: jest.fn().mockImplementation(() => ({
        // Mock methods of QueryEngine here
    })),
}));

jest.mock('n3');
//jest.mock('path');

describe('Storage class', () => {
    describe('loadFile method', () => {
        beforeEach(() => {
            // Reset the mocks before each test
            jest.resetAllMocks();
        });
        // it('should resolve with quads for a valid file path', async () => {
        //     // Mock fs and N3Parser for a valid file scenario
        //     // ... (your mock setup for a valid file path)
        //
        //     const store = storage.getInstance();
        //     const validFilePath = 'path/to/valid/file.ttl';
        //     await expect(store.loadFile(validFilePath)).resolves.toEqual(/* expected quads array */);
        // });

        it('should reject with an error for an invalid file path', async () => {
            N3Parser.mockImplementation(() => ({
                parse: (rdfStream: any, callback: (arg0: Error) => void) => {
                    // Simulate an error during parsing
                    callback(new Error('Parsing error'));
                }
            }));

            const mockReadStream = new Readable({
                read() {
                    this.emit('error', new Error('File not found'));
                }
            });
            (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

            const store = storage.getInstance();
            const invalidFilePath = 'path/to/invalid/file.ttl';
            await expect(store.loadFile(invalidFilePath)).rejects.toThrow();
        });
    });
});