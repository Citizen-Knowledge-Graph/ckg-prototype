// import {
//     loadToShapes,
//     createProfileReport,
//     prettyPrintReport,
//     prettyPrintCombinedReport,
//     containsExistenceViolation
// } from "../src/validator.js";
// // @ts-ignore
// import rdf from 'rdf-ext';
// // @ts-ignore
// import SHACLValidator from 'rdf-validate-shacl';
// // @ts-ignore
// import storage from './storage.js';
//
// jest.mock('rdf-ext');
// jest.mock('rdf-validate-shacl');
// jest.mock('@zazuko/env-node');
// jest.mock('./storage.js');
//
// describe('Validation Utils', () => {
//
//     beforeEach(() => {
//         // Setup your mocks here
//     });
//
//     afterEach(() => {
//         jest.resetAllMocks();
//     });
//
//     describe('loadToShapes', () => {
//         it('should load data from the given file path and return a dataset', async () => {
//             // Arrange
//             const filepath = 'path/to/shapes/file';
//             const mockQuads; // Mock the quad data as needed
//             storage.getInstance.mockReturnValue({
//                 loadFile: jest.fn().mockResolvedValue(mockQuads),
//             });
//
//             // Act
//             const result = await loadToShapes(filepath);
//
//             // Assert
//             expect(storage.getInstance().loadFile).toHaveBeenCalledWith(filepath);
//             // Further assertions for result to be a dataset containing mockQuads
//         });
//     });
//
//     describe('createProfileReport', () => {
//         it('should validate a profile against shapes and return a report', async () => {
//             // Arrange
//             const mockShapes = rdf.dataset();
//             const mockProfile = rdf.dataset();
//             const mockReport = {conforms: true, results: []};
//             const validator = {validate: jest.fn().mockResolvedValue(mockReport)};
//             SHACLValidator.mockImplementation(() => validator);
//
//             // Act
//             const report = await createProfileReport(mockShapes, mockProfile);
//
//             // Assert
//             expect(validator.validate).toHaveBeenCalledWith(mockProfile);
//             expect(report).toEqual(mockReport);
//         });
//     });
//
//     describe('prettyPrintReport', () => {
//         it('should log the results in a table', async () => {
//             // Arrange
//             const mockReport = {conforms: false, results: []}; // Mock as needed
//             const profileName = 'TestProfile';
//             const queryName = 'TestQuery';
//             console.log = jest.fn();
//
//             // Act
//             await prettyPrintReport(mockReport, profileName, queryName);
//
//             // Assert
//             expect(console.log).toHaveBeenCalled();
//             // Further assertions to check the output format
//         });
//     });
//
//     describe('prettyPrintCombinedReport', () => {
//         it('should log the combined results in a table', async () => {
//             // Arrange
//             const mockReports = [
//                 ['Query1', {conforms: true, results: []}],
//                 // More mock reports as needed
//             ];
//             const profileName = 'TestProfile';
//             console.log = jest.fn();
//
//             // Act
//             await prettyPrintCombinedReport(mockReports, profileName);
//
//             // Assert
//             expect(console.log).toHaveBeenCalled();
//             // Further assertions to check the output format
//         });
//     });
//
//     describe('containsExistenceViolation', () => {
//         it('should determine if a report contains an existence violation', () => {
//             // Arrange
//             const mockReport = {
//                 conforms: false,
//                 results: [
//                     // Mock results with a 'MinCountConstraintComponent' violation
//                 ],
//             };
//
//             // Act
//             const hasExistenceViolation = containsExistenceViolation(mockReport);
//
//             // Assert
//             expect(hasExistenceViolation).toBe(true); // or false, depending on your mock data
//         });
//     });
//
// });
