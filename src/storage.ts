// @ts-ignore
import {Store as N3Store, Parser as N3Parser, DataFactory} from "n3"
import fs from "fs";
import {QueryEngine} from "@comunica/query-sparql-rdfjs"
// @ts-ignore
import Table from "cli-table3"
import path from "path";

const { quad } = DataFactory;

class Storage {
    private static _instance: any;
    private readonly data: any;

    constructor() {
        if (Storage._instance) {
            throw new Error("Cannot instantiate more than one Storage, use Storage.getInstance()");
        }
        this.data = new N3Store();
    }

    static getInstance() {
        if (!Storage._instance) {
            Storage._instance = new Storage();
        }
        return Storage._instance;
    }

    /**
     * Loads a turtl file and returns array of quads.
     *
     * @param filePath Path to file.
     */
    async loadFile(filePath: string) {
        console.log("Loading file:", filePath)
        const parser = new N3Parser();
        const rdfStream = fs.createReadStream(filePath);
        const filename = path.basename(filePath, ".ttl")

        return new Promise<any[]>((resolve, reject) => {
            const quads: any[] | PromiseLike<any[]> = [];
            parser.parse(rdfStream, (error: any, newQuad: any, prefixes: any) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else
                if (newQuad) {
                    quads.push(quad(newQuad.subject, newQuad.predicate, newQuad.object, filename))
                } else {
                    resolve(quads);
                }
            });
        });
    }

    /**
     * Persists file to storage.
     *
     * @param filePath Path to file.
     */
    async storeFile(filePath: string) {
        const quads = await this.loadFile(filePath);
        this.data.addQuads(quads);
    }

    /**
     * Prints entire storage to prettified table.
     */
    async buildTable() {
        const engine = new QueryEngine()
        let query = `
            PREFIX sh: <http://www.w3.org/ns/shacl#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            SELECT ?graph (?path AS ?field) ?class ?min ?max (?inValue AS ?exact) ?type WHERE {
                GRAPH ?graph {
                    ?shape sh:property ?propertyShape .
                    ?propertyShape sh:path ?path .
                    OPTIONAL { ?propertyShape sh:class ?class . }
                    OPTIONAL { ?propertyShape sh:minInclusive ?min . }
                    OPTIONAL { ?propertyShape sh:maxInclusive ?max . }
                    OPTIONAL { 
                        ?propertyShape sh:in ?inList . 
                        ?inList rdf:rest*/rdf:first ?inValue .
                    }
                    OPTIONAL { ?propertyShape sh:hasValue ?type . }
                }
            }`
        let bindingsStream = await engine.queryBindings(query, {sources: [this.data]})
        let bindings = await bindingsStream.toArray()

        const groupedByGraph: { [key: string]: any } = {};

        bindings.forEach((binding: any) => {
            const graph = binding.get("graph").value;
            if (!groupedByGraph[graph]) {
                groupedByGraph[graph] = [];
            }
            groupedByGraph[graph].push(binding);
        });

        const headers = ["field", "class", "min", "max", "exact", "type"]
        Object.entries(groupedByGraph).forEach(([graph, bindingsForGraph]) => {
            console.log(`Rules for file: ${graph}`);

            const rows = bindingsForGraph.map((binding: any) => {
                return headers.map(header => {
                    const term = binding.get(header);
                    if (!term) return '';
                    if (term.value.includes('#')) return term.value.split('#')[1];
                    return term.value;
                });
            });

            const table = new Table({head: headers});
            rows.forEach((row: any) => table.push(row));
            console.log(table.toString());
        });

    }
}

export default Storage;
