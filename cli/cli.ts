import {printAllQueries, runQueryOnProfile, runAllQueriesOnProfile} from "../src/lib.js"

type commandType = {
    description: string;
    _function: (...args: string[]) => void;
};

const commands: { [key: string]: commandType } = {
    "print-all-queries": {
        description: "Print all available queries",
        _function: printAllQueries
    },
    "run-query-on-profile": {
        description: "Run single query on a profile: npm start run-query-on-profile <queryName> <profileName>",
        _function: runQueryOnProfile
    },
    "run-all-queries-on-profile": {
        description: "Run all queries on a profile: npm start run-all-queries-on-profile <profileName>",
        _function: runAllQueriesOnProfile
    }
}

const maxLength = Math.max(...Object.keys(commands).map(command => command.length));

function displayHelp() {
    console.log("Available Commands: \n");
    for (let command in commands) {
        console.log(`- ${command.padEnd(maxLength+6)}${commands[command].description}`)
    }
}

export function processCommand(): void {

    const [, , command, ...args] = process.argv

    if (command === undefined) {
        console.log("No command provided.");
        displayHelp();
        return;
    }

    if (!commands.hasOwnProperty(command)) {
        console.log(`Invalid command: ${command}`);
        displayHelp();
        return;
    }

    console.log(`Processing command: ${command}`);

    // Implement command-specific logic here
    if (commands[command]) {
        commands[command]._function(...args)
    } else {
        console.error("Unknown command:", command)
    }
}

processCommand()
