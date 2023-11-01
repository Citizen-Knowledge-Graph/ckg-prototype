// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
// @ts-ignore
import Table from "cli-table3"
import path from "path"
import {hasTypeDeclaration, readFiles} from "./utils.js";
import Storage from "./storage.js";


export async function printAllQueries() {
    const storage = new Storage();

    // load all file paths in db/queries
    const queryPaths = await readFiles("db/queries")

    // import files to storage
    for (const queryPath of queryPaths) {
        await storage.loadFile(queryPath)
    }

    // print table for each graph
    await storage.buildTable();
}

export async function runQueryOnProfile(queryName: string, profileName: string) {
    const profile = await factory.dataset().import(factory.fromFile(`db/profiles/${profileName}.ttl`))
    if (!hasTypeDeclaration(profile, profileName)) return

    const query = await factory.dataset().import(factory.fromFile(`db/queries/${queryName}.ttl`))
    const validator = new SHACLValidator(query, {factory})
    const report = validator.validate(profile)
    // console.log(await report.dataset.serialize({ format: "text/n3" }))

    console.log("--> " + profileName + " is" + (report.conforms ? " " : " NOT ") + "eligible for " + queryName)

    const table = new Table({ head: ["instance", "field", "violation", "is-value", "threshold-value"] })

    for (const result of report.results) {
        let thresholdValue = result.message.length > 0 ? result.message[0].value : "" // extract this via SPARQL? TODO
        let path = result.path.value.split('#')[1] // e.g. houseAge
        let focusNode = result.focusNode.value.split('#')[1] // e.g. House1
        let constraint = result.sourceConstraintComponent.value.split('#')[1]
        let value = result.value ? result.value.value : ""
        let msg = path + " of " + focusNode + (result.value ? (" is " + result.value.value) : " does not exist ")
        let violationType
        if (constraint === "MaxInclusiveConstraintComponent") {
            violationType = "max"
            msg += ", which is over the maximum of " + thresholdValue
        }
        if (constraint === "MinInclusiveConstraintComponent") {
            violationType = "min"
            msg += ", which is below the minimum of " + thresholdValue
        }
        if (constraint === "MinCountConstraintComponent") {
            violationType = "existence"
            thresholdValue = ""
        }
        console.log(msg)
        table.push([focusNode, path, violationType, value, thresholdValue])
    }

    if (table.length > 0) console.log(table.toString())
}

export async function runAllQueriesOnProfile(profileName: string) {
    // Show table: one query per row. Columns: query name, # of violations, # of missing data points
    // Print summary: # of eligible queries, # of non-eligible queries, # of queries with missing data points

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

function containsExistenceViolation(report: any) {
    for (const result of report.results) {
        if (result.sourceConstraintComponent.value.split('#')[1] === "MinCountConstraintComponent") {
            return true
        }
    }
    return false
}

async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
