// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"
import { readFiles } from "./utils.js";
// @ts-ignore
import { QueryEngine } from "@comunica/query-sparql-rdfjs"
// @ts-ignore
import { Store as N3Store } from "n3"
// @ts-ignore
import Table from "cli-table3"

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

    for (const queryName of queryNames) {
        console.log("\n--> " + queryName)
        const ds = await factory.dataset().import(factory.fromFile(queryName))

        const store = new N3Store()
        for (const quad of ds) store.add(quad) // this shouldn't be necessary, is there a more direct way? TODO
        const engine = new QueryEngine()
        let query = `
            PREFIX ckg: <http://ckg.de/default#>
            SELECT ?title WHERE {
                ?s ckg:title ?title .
            }`

        let bindingsStream = await engine.queryBindings(query, { sources: [store] })
        let bindings = await bindingsStream.toArray()
        console.log("Query Title: " + bindings[0].get("title").value)

        query = `
            PREFIX sh: <http://www.w3.org/ns/shacl#>
            SELECT (?path AS ?condition) ?class ?min ?max WHERE {
                ?shape sh:property ?propertyShape .
                ?propertyShape sh:path ?path .
                OPTIONAL { ?propertyShape sh:class ?class . }
                OPTIONAL { ?propertyShape sh:minInclusive ?min . }
                OPTIONAL { ?propertyShape sh:maxInclusive ?max . }
            }`
        bindingsStream = await engine.queryBindings(query, { sources: [store] })
        bindings = await bindingsStream.toArray()

        const headers = ["condition", "class", "min", "max"]
        const rows = bindings.map((binding: any) => {
            return headers.map(header => {
                const term = binding.get(header)
                if (!term) return ''
                if (term.value.includes('#')) return term.value.split('#')[1]
                return term.value
            })
        })
        const table = new Table({ head: headers })
        rows.forEach((row: any) => table.push(row))
        console.log(table.toString())

        // for (const quad of ds) {
        //     if (quad.predicate.value === "http://ckg.de/default#title") {
        //         console.log("Query Title: " + quad.object.value)
        //     }
        // }
    }
}

// TODO
async function runAllQueriesOnProfile(profileName: string) {}
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
