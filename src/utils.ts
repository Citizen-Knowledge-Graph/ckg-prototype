import path from "path";
import fs from "fs/promises";
import { NamedShape } from "./validator.js";

const PREFIX = {
    RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    CKG: "http://ckg.de/default#",
}

export async function readFiles(directory: string): Promise<string[]> {
    const fileNames = await fs.readdir(directory)
    return fileNames.map(fileName => path.join(directory, fileName))
}

// SHACL can't seem to be used to ensure this triple exists, only when it exists it can be validated.
// So this is the workaround to ensure a root-triple. SHACL can then take it from there.
export function hasTypeDeclaration(namedShape: NamedShape): boolean {
    let exists = Array.from(namedShape.shape).some((quad: any) => quad.subject.value === PREFIX.CKG + "this" && quad.predicate.value === PREFIX.RDF + "type")
    if (!exists) console.error("The profile " + namedShape.name + " can't be processed because it does not declare a type.")
    return exists
}

export const extractValue = (uri: string) => uri.split('#')[1];
