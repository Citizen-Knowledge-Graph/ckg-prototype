import {hasTypeDeclaration, readFiles} from "./utils.js";
import {
    createProfileReport,
    loadToShapes,
    prettyPrintMissingDataAnalysis,
    prettyPrintCombinedReport,
    prettyPrintReport,
    ValidationReport
} from "./validator.js";
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
    for (const queryPath of queryPaths) { await store.storeFile(queryPath) }

    // print table
    await store.buildTable();
}

export async function runQueryOnProfile(queryName: string, profileName: string) {
    // load profile file without storing
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile, profileName)) return

    // load query file
    const shapes = await loadToShapes(`db/queries/${queryName}.ttl`)

    // create report
    const report = await createProfileReport(shapes, profile)

    // print report
    prettyPrintReport(report, profileName, queryName)
}

export async function runAllQueriesOnProfile(profileName: string) {

    // load profile file
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile, profileName)) return

    // load shapes from all query files
    const queryPaths = await readFiles("db/queries")
    const queries: [string, rdf.dataset][] = await Promise.all(queryPaths.map(async queryPath =>
        [path.basename(queryPath, ".ttl"), await loadToShapes(queryPath)]
    ))

    // create collection of reports
    const reports = await Promise.all(
        queries.map(async (query):  Promise<[string, ValidationReport]> => {
            return [query[0], await createProfileReport(query[1], profile)]
        })
    );

    // print combined reports
    prettyPrintCombinedReport(reports, profileName)

    // print missing data analysis
    await prettyPrintMissingDataAnalysis(reports)
}

function createProfile() {}
function createQuery() {}
