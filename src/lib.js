import SHACLValidator from "rdf-validate-shacl"
import factory from "@zazuko/env-node"

export async function runQueryOnProfile(queryName, profileName) {
    const shapes = await factory.dataset().import(factory.fromFile(`queries/${queryName}.ttl`))
    const data = await factory.dataset().import(factory.fromFile(`profiles/${profileName}.ttl`))

    const validator = new SHACLValidator(shapes, { factory })
    const report = await validator.validate(data)

    // get report details: https://github.com/zazuko/rdf-validate-shacl#usage
    // console.log(await report.dataset.serialize({ format: "text/n3" }))

    console.log("--> " + profileName + " is" + (report.conforms ? " " : " not ") + "eligible for " + queryName)
    // TODO in case of non-conformity, print the violations
}

// TODO
async function runAllQueriesOnProfile(profileName) {}
async function runAllQueriesOnAllProfiles() {}
function createProfile() {}
function createQuery() {}
