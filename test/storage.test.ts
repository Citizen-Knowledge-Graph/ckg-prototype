import storage from '../src/storage'; // replace with your actual import path
import fs from 'fs';
// @ts-ignore
import {Parser as N3Parser, DataFactory as N3DataFactory} from 'n3';
//import path from 'path';
import {Readable} from 'stream';

jest.mock('fs', () => ({
    createReadStream: jest.fn(),
}));

jest.mock('n3', () => {
    const actualN3 = jest.requireActual('n3');
    return {
        ...actualN3,
        DataFactory: {
            ...actualN3.DataFactory,
            quad: (subject: any, predicate: any, object: any, graph: any) => ({
                subject: subject,
                predicate: predicate,
                object: object,
                graph: graph
            }),
        },
        Parser: jest.fn()
    }
});

jest.mock('@comunica/query-sparql-rdfjs', () => ({
    QueryEngine: jest.fn().mockImplementation(() => ({
        // Mock methods of QueryEngine here
    })),
}));
//jest.mock('path');

describe('Storage class', () => {
    describe('loadFile method', () => {
        it('should resolve with quads for a valid file path', async () => {

            /* Arrange */
            const filename: string = 'file';

            // N3 Mock
            N3Parser.mockImplementation(() => ({
                parse: (rdfStream: any, callback: (arg0: null, arg1: null) => void) => {
                    // Simulate the parser reading and emitting quads
                    const mockQuad =
                        N3DataFactory.quad(
                            'https://example.org/subject',
                            'https://example.org/predicate',
                            '"100"^^http://www.w3.org/2001/XMLSchema#integer',
                            ""
                        );

                    // Simulate streaming of quads
                    callback(null, mockQuad);

                    // Simulate end of stream
                    callback(null, null);
                }
            }));

            // FS Mock
            const mockReadStream = new Readable({
                read() {
                    this.push('some data');
                    this.push(null);
                }
            });

            const store = storage.getInstance();
            const validFilePath = `path/to/valid/${filename}.ttl`;

            // Assert
            await expect(store.loadFile(validFilePath)).resolves.toEqual(
                [
                    N3DataFactory.quad(
                        'https://example.org/subject',
                        'https://example.org/predicate',
                        '"100"^^http://www.w3.org/2001/XMLSchema#integer',
                        filename
                    )
                ]
            );
        });

        it('should reject with an error for an invalid file path', async () => {
            // N3 Mock
            N3Parser.mockImplementation(() => ({
                parse: (rdfStream: any, callback: (arg0: Error) => void) => {
                    // Simulate an error during parsing
                    callback(new Error('Parsing error'));
                }
            }));

            // FS Mock
            const mockReadStream = new Readable({
                read() {
                    this.emit('error', new Error('File not found'));
                }
            });
            (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

            const store = storage.getInstance();
            const invalidFilePath = 'path/to/invalid/file.ttl';
            await expect(store.loadFile(invalidFilePath)).rejects.toThrow("Parsing error");
        });
    });
});