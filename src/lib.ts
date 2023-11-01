// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
// @ts-ignore
import Table from "cli-table3"
import { hasTypeDeclaration, readFiles } from "./utils.js";
import {containsExistenceViolation, createProfileReport, loadToShapes, prettyPrintReport} from "./validator.js";
import path from "path";
import storage from "./storage.js";



export async function printAllQueries() {
    const store = storage.getInstance()
    const queryPaths = await readFiles("db/queries")
    for (const queryPath of queryPaths) { await store.loadFile(queryPath) }
    await store.buildTable();
}

export async function runQueryOnProfile(queryName: string, profileName: string) {

    // load query file
    const shapes = await loadToShapes(`db/queries/${queryName}.ttl`)

    // load profile file
    const profile = await loadToShapes(`db/profiles/${profileName}.ttl`)
    if (!hasTypeDeclaration(profile, profileName)) return

    const report = await createProfileReport(shapes, profile)
    await prettyPrintReport(report, profileName, queryName)
}

void runQueryOnProfile("citizen-solar-funding", "citizen-a")

export async function runAllQueriesOnProfile(profileName: string) {
    const profile = await factory.dataset().import(factory.fromFile(`db/profiles/${profileName}.ttl`))
    if (!hasTypeDeclaration(profile, profileName)) return

    const table = new Table({ head: ["query", "eligible", "non-eligible", "missing-data"] })

    const queryPaths = await readFiles("db/queries")
    for (const queryPath of queryPaths) {
        const query = await factory.dataset().import(factory.fromFile(queryPath))
        const queryName = path.basename(queryPath, ".ttl")
        const validator = new SHACLValidator(query, {factory})
        const report = validator.validate(profile)
        if (report.conforms) {
            table.push([queryName, "x", "", ""])
            continue
        }
        if (containsExistenceViolation(report)) {
            table.push([queryName, "", "", "x"])
            continue
        }
        table.push([queryName, "", "x", ""])
    }

    console.log("--> Results of running all queries on " + profileName + ":")
    console.log(table.toString())
    console.log("For more details, run for instance \"npm start run-query-on-profile citizen-solar-funding " + profileName + "\"")
}

// TODO
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
