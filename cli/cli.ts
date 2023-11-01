import { printAllQueries, runQueryOnProfile, runAllQueriesOnProfile } from "../src/lib.js"

const commands: { [key: string] : (...args: string[]) => void } = {
    "print-all-queries": printAllQueries,
    "run-query-on-profile": runQueryOnProfile,
    "run-all-queries-on-profile": runAllQueriesOnProfile
}

const [, , command, ...args] = process.argv

if (commands[command]) {
    commands[command](...args)
} else {
    console.error("Unknown command:", command)
}
