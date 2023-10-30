import path from "path";
import fs from "fs/promises";

import {ROOT_PATH} from "./config.js";

export async function readFiles(directory: string): Promise<string[]> {
    const directoryPath: string = path.join(ROOT_PATH, directory);
    const fileNames = await fs.readdir(directoryPath)
    return fileNames.map(fileName => path.join(directoryPath, fileName))
}
