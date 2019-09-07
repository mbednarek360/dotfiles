"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const util = require("util");
exports.readFileAsync = util.promisify(fs.readFile);
exports.writeFileAsync = util.promisify(fs.writeFile);
function joinBuffers(buffers) {
    return Buffer.concat(buffers).toString();
}
function runChildProcess(program, args, cwd, input, cancel) {
    return new Promise((resolve, reject) => {
        const process = child_process.spawn(program, args, { cwd });
        const stdoutBuffer = [];
        const stderrBuffer = [];
        process.on("error", reject);
        process.on("exit", (code) => resolve([code, joinBuffers(stdoutBuffer), joinBuffers(stderrBuffer)]));
        process.stdout.on("data", (chunk) => stdoutBuffer.push(chunk));
        process.stderr.on("data", (chunk) => stderrBuffer.push(chunk));
        if (cancel) {
            cancel.then(() => process.kill());
        }
        try {
            process.stdin.end(input);
        }
        catch (error) {
            // Ignored.
        }
    });
}
exports.runChildProcess = runChildProcess;
//# sourceMappingURL=utilities.js.map