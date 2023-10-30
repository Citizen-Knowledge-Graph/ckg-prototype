// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
import { readFiles } from "./utils.js";


export async function runQueryOnProfile(queryName: string, profileName: string) {
    const shapes = await factory.dataset().import(factory.fromFile(`db/queries/${queryName}.ttl`))
    const data = await factory.dataset().import(factory.fromFile(`db/profiles/${profileName}.ttl`))

    const validator = new SHACLValidator(shapes, { factory })
    const report = validator.validate(data)

    // get report details: https://github.com/zazuko/rdf-validate-shacl#usage
    // console.log(await report.dataset.serialize({ format: "text/n3" }))

    console.log("--> " + profileName + " is" + (report.conforms ? " " : " NOT ") + "eligible for " + queryName)

    for (const result of report.results) {
        let thresholdValue = result.message[0].value
        let path = result.path.value.split('#')[1] // houseAge
        let focusNode = result.focusNode.value.split('#')[1] // House1
        let constraint = result.sourceConstraintComponent.value.split('#')[1]
        let msg = path + " of " + focusNode + " is xy, which is " // TODO extract actual value
        if (constraint === "MaxInclusiveConstraintComponent") {
            msg += "over the maximum of "
        }
        if (constraint === "MinInclusiveConstraintComponent") {
            msg += "below the minimum of "
        }
        console.log(msg + thresholdValue)
    }
}

export async function printAllQueries() {

    // load all file names in db/queries
    const queryNames = await readFiles("db/queries")
    console.log(queryNames)

    let quads = [];
    for (const queryName of queryNames) {
        quads.push(await factory.dataset().import(factory.fromFile(queryName)))
    }

    const queries = await factory.dataset().addAll(...quads)
    console.log(queries)
}

void printAllQueries()

// TODO
async function runAllQueriesOnProfile(profileName: string) {}
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
