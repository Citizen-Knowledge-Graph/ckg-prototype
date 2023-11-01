import {hasTypeDeclaration, readFiles} from "./utils.js";
import {
    createProfileReport,
    loadToShapes,
    prettyPrintCombinedReport,
    prettyPrintReport
} from "./validator.js";
import path from "path";
import storage from "./storage.js";


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
    await prettyPrintReport(report, profileName, queryName)
}

export async function runAllQueriesOnProfile(profileName: string) {

    // load profile file
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile, profileName)) return

    // load shapes from all query files
    const queryPaths = await readFiles("db/queries")
    const shapes = await Promise.all(queryPaths.map(async queryPath =>
        [path.basename(queryPath, ".ttl"), await loadToShapes(queryPath)]
    ))

    // create collection of reports
    const reports = await Promise.all(
        shapes.map(async shape => {
            return [shape[0], await createProfileReport(shape[1], profile)]
        })
    );

    // print combined report
    await prettyPrintCombinedReport(reports, profileName)
}

// TODO
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
