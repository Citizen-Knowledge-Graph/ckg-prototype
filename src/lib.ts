// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
// @ts-ignore
import factory from "@zazuko/env-node"

export async function runQueryOnProfile(queryName: string, profileName: string) {
    const shapes = await factory.dataset().import(factory.fromFile(`db/queries/${queryName}.ttl`))
    const data = await factory.dataset().import(factory.fromFile(`db/profiles/${profileName}.ttl`))

    const validator = new SHACLValidator(shapes, { factory })
    const report = await validator.validate(data)

    // get report details: https://github.com/zazuko/rdf-validate-shacl#usage
    // console.log(await report.dataset.serialize({ format: "text/n3" }))

    console.log("--> " + profileName + " is" + (report.conforms ? " " : " not ") + "eligible for " + queryName)
    // TODO in case of non-conformity, print the violations
}

// TODO
async function runAllQueriesOnProfile(profileName: string) {}
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
