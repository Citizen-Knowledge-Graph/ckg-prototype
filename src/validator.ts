// @ts-ignore
import rdf from 'rdf-ext';
// @ts-ignore
import SHACLValidator from "rdf-validate-shacl"
import factory from "@zazuko/env-node"
import storage from "./storage.js";
// @ts-ignore
import {DataFactory, Store as N3Store} from "n3"
import {QueryEngine} from "@comunica/query-sparql-rdfjs"
import path from "path";

const {quad} = DataFactory;

// Define TypeScript types for the shape and report objects
export interface NamedValidationReport {
    queryName: string;
    profileName: string;
    report: ValidationReport;
}

function NamedValidationReport(queryName: string, profileName: string, report: ValidationReport): NamedValidationReport {
    return {
        queryName: queryName,
        profileName: profileName,
        report: report
    }
}

interface ValidationReport {
    conforms: boolean;
    results: Result[];
}

interface Result {
    focusNode: rdf.NamedNode;
    path: rdf.NamedNode;
    sourceConstraintComponent: rdf.NamedNode;
    message: rdf.Literal[];
    value?: rdf.Term;
}

export interface NamedShape {
    name: string;
    shape: rdf.Dataset
}

export function NamedShape(name: string, shape: rdf.Dataset): NamedShape {
    return {
        name: name,
        shape: shape
    }
}

/**
 * Loads data from filepath to a shapes object. Shapes object is used to validate profiles.
 */
export async function loadToShapes(filepath: string): Promise<NamedShape> {
    const store = storage.getInstance();
    const quads = await store.loadFile(filepath);
    return NamedShape(path.basename(filepath, ".ttl"), rdf.dataset(quads))
}

/**
 * Returns validator object
 */
function createValidator(shapes: rdf.Dataset): SHACLValidator {
    return new SHACLValidator(shapes, {factory});
}

/**
 * Create report for profile
 */
export async function createValidationReport(shapes: NamedShape, profile: NamedShape): Promise<NamedValidationReport> {
    const validator = createValidator(shapes.shape);
    return NamedValidationReport(shapes.name, profile.name, await validator.validate(profile.shape));
}
