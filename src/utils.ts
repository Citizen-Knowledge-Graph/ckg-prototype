import path from "path";
import fs from "fs/promises";

import {ROOT_PATH} from "./config.js";

const PREFIX = {
    RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    CKG: "http://ckg.de/default#",
}

export async function readFiles(directory: string): Promise<string[]> {
    const directoryPath: string = path.join(ROOT_PATH, directory);
    const fileNames = await fs.readdir(directoryPath)
    return fileNames.map(fileName => path.join(directoryPath, fileName))
}

// SHACL can't seem to be used to ensure this triple exists, only when it exists it can be validated.
// So this is the workaround to ensure a root-triple. SHACL can then take it from there.
export function hasTypeDeclaration(data: any, profileName: string): boolean {
    let exists = Array.from(data).some((quad: any) => quad.subject.value === PREFIX.CKG + "this" && quad.predicate.value === PREFIX.RDF + "type")
    if (!exists) console.error("The profile " + profileName + " can't be processed because it does not declare a type.")
    return exists
}
