// @ts-ignore
import {Store as N3Store, Parser as N3Parser, DataFactory} from "n3"
import fs from "fs";
// @ts-ignore
import {QueryEngine} from "@comunica/query-sparql-rdfjs"
// @ts-ignore
import Table from "cli-table3"

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

    async loadFile(filename: string) {
        const parser = new N3Parser();
        const rdfStream = fs.createReadStream(filename);
        console.log("Loading file:", filename)

        return new Promise<void>((resolve, reject) => {
            parser.parse(rdfStream, (error: any, newQuad: any, prefixes: any) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else
                if (newQuad) {
                    this.data.add(quad(newQuad.subject, newQuad.predicate, newQuad.object, filename));
                } else {
                    resolve();
                }
            });
        });
    }

    // this looks pretty chaotic - would require some more work to make it readable
    async buildTable() {
        const engine = new QueryEngine()
        let query = `
            PREFIX sh: <http://www.w3.org/ns/shacl#>
            SELECT ?graph (?path AS ?condition) ?class ?min ?max (?inValue AS ?exact) WHERE {
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

        const headers = ["condition", "class", "min", "max", "exact"]
        Object.entries(groupedByGraph).forEach(([graph, bindingsForGraph]) => {
            console.log(`Results for file (graph): ${graph}`);

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