import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const currentFilePath = fileURLToPath(import.meta.url);
const __dirname = dirname(currentFilePath);

export const ROOT_PATH: string = path.resolve(__dirname, "../");
