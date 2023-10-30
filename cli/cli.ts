import { runQueryOnProfile, printAllQueries } from "../src/lib.js"

const commands: { [key: string] : (...args: string[]) => void } = {
    "run-query-on-profile": runQueryOnProfile,
    "print-all-queries": printAllQueries
}

const [, , command, ...args] = process.argv

if (commands[command]) {
    commands[command](...args)
} else {
    console.error("Unknown command:", command)
}
