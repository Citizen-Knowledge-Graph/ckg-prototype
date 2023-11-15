import {NamedValidationReport} from "./validator";
// @ts-ignore
import Table from "cli-table3";
import {extractValue} from "./utils.js";
import {QueryEngine} from "@comunica/query-sparql-rdfjs";
// @ts-ignore
import rdf from 'rdf-ext';
// @ts-ignore
import {DataFactory, Store as N3Store} from "n3"
const {quad} = DataFactory;

function containsExistenceViolation(report: NamedValidationReport): boolean {
    return report.report.results.some(result => extractValue(result.sourceConstraintComponent.value) === 'MinCountConstraintComponent');
}

/**
 * Create pretty report output for profile and a set of constraints
 */
export function prettyPrintReport(report: NamedValidationReport) {
    console.log(`--> ${report.profileName} is ${report.report.conforms ? '' : 'NOT '}eligible for ${report.queryName}`);

    const headers = ['Instance', 'Field', 'Violation', 'Is-Value', 'Threshold-Value'];
    const table = new Table({head: headers});

    report.report.results.forEach((result) => {
        const thresholdValue = result.message[0] ? result.message[0].value : "No threshold value found";
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
export function prettyPrintCombinedReport(reports: NamedValidationReport[]) {
    const table = new Table({head: ['Query', 'Eligible', 'Non-eligible', 'Missing-data']});

    for (const report of reports) {
        const eligibilityRow = report.report.conforms
            ? [report.queryName, 'x', '', '']
            : containsExistenceViolation(report)
                ? [report.queryName, '', '', 'x']
                : [report.queryName, '', 'x', ''];

        table.push(eligibilityRow);
    }

    console.log(`\n--> Results of running all queries on ${reports[0].profileName}:`);
    console.log(table.toString());
    console.log(`For more details, run for instance: "npm start run-query-on-profile citizen-solar-funding ${reports[0].profileName}}"`);
}


export async function prettyPrintMissingDataAnalysis(reports:NamedValidationReport[]) {
    const engine = new QueryEngine()
    const missingDataMap: Record<string, string[]> = {}; // key: array of missing-data identifiers, value: array of queryNames where this occurred

    for (const namedReport of reports) {
        if (namedReport.report.conforms) continue;
        let relevantResults = namedReport.report.results.filter(result => extractValue(result.sourceConstraintComponent.value) === 'MinCountConstraintComponent');
        if (relevantResults.length === 0) continue;
        let store = new N3Store();
        // @ts-ignore
        for (const q of report.dataset._quads) {
            store.add(quad(q[1].subject, q[1].predicate, q[1].object));
        }
        const missingDataIdentifiers: string[] = []

        for (let result of relevantResults) {
            let sparqlQuery = `
            PREFIX sh: <http://www.w3.org/ns/shacl#>
            SELECT ?class ?datatype WHERE {
                ?shape sh:focusNode <${result.focusNode.id}> .
                ?shape sh:resultPath <${result.path.id}> .
                ?shape sh:sourceShape ?sourceShape .
                OPTIONAL { ?sourceShape sh:class ?class .}
                OPTIONAL { ?sourceShape sh:datatype ?datatype . }
            }`
            let bindingsStream = await engine.queryBindings(sparqlQuery, {sources: [store]})
            let bindings: rdf.Bindings = await bindingsStream.toArray()
            for (let binding of bindings) {
                ["class", "datatype"]
                    .filter(key => binding.has(key))
                    .forEach(key => {
                        missingDataIdentifiers.push(extractValue(result.path.value) + "(" + extractValue(binding.get(key).value) + ")");
                    });
            }
        }

        const keyStr = missingDataIdentifiers.sort().join(",");
        if (!missingDataMap[keyStr]) missingDataMap[keyStr] = []
        missingDataMap[keyStr].push(namedReport.queryName)
    }

    // sort them by length of value array? or by a score calculating how useful it would be to fix this missing data?
    for (const [keyStr, values] of Object.entries(missingDataMap)) {
        let missingDataIdentifiers = keyStr.split(",");
        console.log(`\nIf you add ${missingDataIdentifiers.length > 1 ? "these" : "this"} ${missingDataIdentifiers.length} data point${missingDataIdentifiers.length > 1 ? "s" : ""}, I can check your eligibility for ${values.length} more quer${values.length > 1 ? "ies" : "y"}:`)
        console.log(missingDataIdentifiers, " --> ", values, "\n")
    }
}