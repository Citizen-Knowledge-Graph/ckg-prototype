import {hasTypeDeclaration, readFiles} from "./utils.js";
import {
    createValidationReport,
    loadToShapes,
    NamedValidationReport
} from "./validator.js";
import {
    prettyPrintMissingDataAnalysis,
    prettyPrintCombinedReport,
    prettyPrintReport
} from "./view.js";
import path from "path";
import storage from "./storage.js";
// @ts-ignore
import rdf from 'rdf-ext';


export async function printAllQueries() {
    // instantiate storage
    const store = storage.getInstance()

    // retrieve file paths
    const queryPaths = await readFiles("db/queries")

    // load files to storage
    for (const queryPath of queryPaths) {
        await store.storeFile(queryPath)
    }

    // print table
    await store.buildTable();
}

export async function runQueryOnProfile(queryName: string, profileName: string) {
    // load profile file without storing
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile)) return

    // load query file
    const shapes = await loadToShapes(`db/queries/${queryName}.ttl`)

    // create report
    const report = await createValidationReport(shapes, profile)

    // print report
    prettyPrintReport(report)
}

export async function runAllQueriesOnProfile(profileName: string) {

    // load profile file
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile)) return

    // load shapes from all query files
    const queryPaths = await readFiles("db/queries")
    const queries: rdf.dataset[] = await Promise.all(
        queryPaths.map(async queryPath => await loadToShapes(queryPath))
    )

    // create collection of reports
    const reports = await Promise.all(
        queries.map(async (query): Promise<NamedValidationReport> => (await createValidationReport(query, profile)))
    );

    // print combined reports
    prettyPrintCombinedReport(reports)

    // print missing data analysis
    await prettyPrintMissingDataAnalysis(reports)
}

function createProfile() {
}

function createQuery() {
}
