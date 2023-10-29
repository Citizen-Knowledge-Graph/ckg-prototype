import { runQueryOnProfile } from "../src/lib.js"

const commands: { [key: string] : (...args: string[]) => void } = {
    "run-query-on-profile": runQueryOnProfile,
}

const [, , command, ...args] = process.argv

if (commands[command]) {
    commands[command](...args)
} else {
    console.error("Unknown command:", command)
}
