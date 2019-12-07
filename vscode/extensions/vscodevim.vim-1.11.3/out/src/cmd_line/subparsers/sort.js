"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node = require("../commands/sort");
const scanner_1 = require("../scanner");
function parseSortCommandArgs(args) {
    if (!args) {
        return new node.SortCommand({ reverse: false, ignoreCase: false, unique: false });
    }
    let scannedArgs = {
        reverse: false,
        ignoreCase: false,
        unique: false,
    };
    let scanner = new scanner_1.Scanner(args);
    const c = scanner.next();
    scannedArgs.reverse = c === '!';
    const nextWord = scanner.nextWord();
    // NOTE: vim supports `:sort ui` to do both insensitive and unique
    // at the same time. We felt this would be very uncommon usage so
    // chose to keep it simple and leave that functionality out.
    // See https://github.com/VSCodeVim/Vim/pull/4148
    scannedArgs.ignoreCase = nextWord === 'i';
    scannedArgs.unique = nextWord === 'u';
    return new node.SortCommand(scannedArgs);
}
exports.parseSortCommandArgs = parseSortCommandArgs;

//# sourceMappingURL=sort.js.map
