// @ts-ignore
import rdf from 'rdf-ext';
// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
import storage from "./storage.js";
// @ts-ignore
import Table from "cli-table3";

/**
 * Loads data from filepath to a shapes object. Shapes object is used to validate profiles.
 */
export async function loadToShapes(filepath: string) {
    const store = storage.getInstance()
    const quads = await store.loadFile(filepath)
    return rdf.dataset(quads)
}

/**
 * Returns validator object
 */
function createValidator(shapes: any) {
    return new SHACLValidator(shapes, { factory })
}

/**
 * Create report for profile
 */
export async function createProfileReport(shapes: any, profile: any) {
    const validator = createValidator(shapes)
    return validator.validate(profile)
}

/**
 * Create pretty report output for profile and a set of constraints
 */
export async function prettyPrintReport(report: any, profileName: string, queryName: string) {
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
    if (table.length > 0) console.log(table.toString())
}

/**
 * Create pretty report output for profile and a multiple constraints
 */
export async function prettyPrintCombinedReport(reports: any[][], profileName: string) {
    const table = new Table({head: ["query", "eligible", "non-eligible", "missing-data"]})
    for (const [queryName, report] of reports) {

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

export function containsExistenceViolation(report: any) {
    for (const result of report.results) {
        if (result.sourceConstraintComponent.value.split('#')[1] === "MinCountConstraintComponent") {
            return true
        }
    }
    return false
}
