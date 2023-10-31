// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
// @ts-ignore
import Table from "cli-table3"
import {hasTypeDeclaration, readFiles} from "./utils.js";
import Storage from "./storage.js";


export async function printAllQueries() {
    const storage = new Storage();

    // load all file names in db/queries
    const queryNames = await readFiles("db/queries")

    // load files to storage
    for (const queryName of queryNames) {
        await storage.loadFile(queryName)
    }

    // print table for each graph
    await storage.buildTable();
}

export async function runQueryOnProfile(queryName: string, profileName: string) {
    const shapes = await factory.dataset().import(factory.fromFile(`db/queries/${queryName}.ttl`))
    const data = await factory.dataset().import(factory.fromFile(`db/profiles/${profileName}.ttl`))

    if (!hasTypeDeclaration(data)) {
        console.error("The profile " + profileName + " can't be processed because it does not declare a type.")
        return
    }

    const validator = new SHACLValidator(shapes, {factory})
    const report = validator.validate(data)

    // get report details: https://github.com/zazuko/rdf-validate-shacl#usage
    // console.log(await report.dataset.serialize({ format: "text/n3" }))

    console.log("--> " + profileName + " is" + (report.conforms ? " " : " NOT ") + "eligible for " + queryName)

    const headers = ["instance", "field", "violation", "is-value", "threshold-value"]
    const table = new Table({head: headers})

    for (const result of report.results) {
        let thresholdValue = result.message[0].value // extract this via SPARQL? TODO
        let path = result.path.value.split('#')[1] // houseAge
        let focusNode = result.focusNode.value.split('#')[1] // House1
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

    console.log(table.toString())
}

async function runAllQueriesOnProfile(profileName: string) {
    // TODO
    // Show table: one query per row. Columns: query name, # of violations, # of missing data points
    // Print summary: # of eligible queries, # of non-eligible queries, # of queries with missing data points
}

async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
