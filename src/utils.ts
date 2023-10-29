import path from "path";
import fs from "fs/promises";

import { ROOT_PATH} from "./config.js";

export async function readFiles(directory: string): Promise<string[]> {
    const directoryPath: string = path.join(ROOT_PATH, directory);
    let files: string[] = [];

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return;
        }

        const fullFilePaths = files.map((file: string) => path.join(directoryPath, file));
        console.log(fullFilePaths);
    });
}
