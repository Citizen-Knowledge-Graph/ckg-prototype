// @ts-ignore
import rdf from 'rdf-ext';
// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
import storage from "./storage.js";
// @ts-ignore
import Table from "cli-table3";
// @ts-ignore
import { DataFactory, Store as N3Store } from "n3"
// @ts-ignore
import { QueryEngine } from "@comunica/query-sparql-rdfjs"
const { quad } = DataFactory;

// Define TypeScript types for the shape and report objects
export interface ValidationReport { conforms: boolean; results: Result[]; }
interface Result {
    focusNode: rdf.NamedNode;
    path: rdf.NamedNode;
    sourceConstraintComponent: rdf.NamedNode;
    message: rdf.Literal[];
    value?: rdf.Term;
}

const extractValue = (uri: string) => uri.split('#')[1];

/**
 * Loads data from filepath to a shapes object. Shapes object is used to validate profiles.
 */
export async function loadToShapes(filepath: string): Promise<rdf.Dataset> {
    const store = storage.getInstance();
    const quads = await store.loadFile(filepath);
    return rdf.dataset(quads);
}

/**
 * Returns validator object
 */
function createValidator(shapes: rdf.Dataset): SHACLValidator {
    return new SHACLValidator(shapes, { factory });
}

/**
 * Create report for profile
 */
export async function createProfileReport(shapes: rdf.Dataset, profile: rdf.Dataset): Promise<ValidationReport> {
    const validator = createValidator(shapes);
    return validator.validate(profile);
}

/**
 * Create pretty report output for profile and a set of constraints
 */
export function prettyPrintReport(report: ValidationReport, profileName: string, queryName: string) {
    console.log(`--> ${profileName} is ${report.conforms ? '' : 'NOT '}eligible for ${queryName}`);

    const headers = ['Instance', 'Field', 'Violation', 'Is-Value', 'Threshold-Value'];
    const table = new Table({ head: headers });

    report.results.forEach((result) => {
        const thresholdValue = result.message[0]?result.message[0].value : "No threshold value found";
        const path = extractValue(result.path.value);
        const focusNode = extractValue(result.focusNode.value);
        const constraint = extractValue(result.sourceConstraintComponent.value);
        const value = result.value?.value ?? '';
        let msg = `${path} of ${focusNode} ${result.value ? `is ${value}` : 'does not exist'}`;
        let violationType: string | null = null;

        switch (constraint) {
            case 'MaxInclusiveConstraintComponent':
                violationType = 'max';
                msg += `, which is over the maximum of ${thresholdValue}`;
                break;
            case 'MinInclusiveConstraintComponent':
                violationType = 'min';
                msg += `, which is below the minimum of ${thresholdValue}`;
                break;
            case 'MinCountConstraintComponent':
                violationType = 'existence';
                break;
        }

        console.log(msg);
        if (violationType)
            table.push([focusNode, path, violationType, value, thresholdValue]);
    });

    if (table.length > 0) {
        console.log(table.toString());
    }
}

/**
 * Create pretty report output for profile and a multiple constraints
 */
export function prettyPrintCombinedReport(reports: [string, ValidationReport][], profileName: string) {
    const table = new Table({ head: ['Query', 'Eligible', 'Non-eligible', 'Missing-data'] });

    for (const [queryName, report] of reports) {
        const eligibilityRow = report.conforms
            ? [queryName, 'x', '', '']
            : containsExistenceViolation(report)
                ? [queryName, '', '', 'x']
                : [queryName, '', 'x', ''];

        table.push(eligibilityRow);
    }

    console.log(`\n--> Results of running all queries on ${profileName}:`);
    console.log(table.toString());
    console.log(`For more details, run for instance: "npm start run-query-on-profile citizen-solar-funding ${profileName}"`);
}

export function containsExistenceViolation(report: ValidationReport): boolean {
    return report.results.some(result => extractValue(result.sourceConstraintComponent.value) === 'MinCountConstraintComponent');
}

export async function prettyPrintMissingDataAnalysis(reports: [string, ValidationReport][], profileName: string) {
    const engine = new QueryEngine()
    const missingDataMap: Record<string, string[]> = {}; // key: array of missing-data identifiers, value: array of queryNames where this occurred

    for (const [queryName, report] of reports) {
        if (report.conforms) continue;
        let relevantResults = report.results.filter(result => extractValue(result.sourceConstraintComponent.value) === 'MinCountConstraintComponent');
        if (relevantResults.length === 0) continue;
        let store = new N3Store();
        // @ts-ignore
        for (const q of report.dataset._quads) {
            store.add(quad(q[1].subject, q[1].predicate, q[1].object));
        }
        const missingDataIdentifiers = []

        for (let result of relevantResults) {
            let sparqlQuery = `
            PREFIX sh: <http://www.w3.org/ns/shacl#>
            SELECT ?class ?datatype WHERE {
                ?shape sh:focusNode <${result.focusNode.id}> .
                ?shape sh:resultPath <${result.path.id}> .
                ?shape sh:sourceShape ?sourceShape .
                OPTIONAL { ?sourceShape sh:class ?class . }
                OPTIONAL { ?sourceShape sh:datatype ?datatype . }
            }`
            let bindingsStream = await engine.queryBindings(sparqlQuery, {sources: [store]})
            let bindings = await bindingsStream.toArray()
            for (let binding of bindings) {
                let type
                if (binding.has("class")) type = "class"
                if (binding.has("datatype")) type = "datatype"
                missingDataIdentifiers.push(extractValue(result.path.value) + "(" + extractValue(binding.get(type).value) + ")")
            }
        }

        const keyStr = missingDataIdentifiers.sort().join(",");
        if (!missingDataMap[keyStr]) missingDataMap[keyStr] = []
        missingDataMap[keyStr].push(queryName)
    }

    // sort them by length of value array? or by a score calculating how useful it would be to fix this missing data?
    for (const [keyStr, values] of Object.entries(missingDataMap)) {
        let missingDataIdentifiers = keyStr.split(",");
        console.log(`\nIf you add ${missingDataIdentifiers.length > 1 ? "these" : "this"} ${missingDataIdentifiers.length} data point${missingDataIdentifiers.length > 1 ? "s" : ""}, I can check your eligibility for ${values.length} more quer${values.length > 1 ? "ies" : "y"}:`)
        console.log(missingDataIdentifiers, " --> ", values, "\n")
    }
}
