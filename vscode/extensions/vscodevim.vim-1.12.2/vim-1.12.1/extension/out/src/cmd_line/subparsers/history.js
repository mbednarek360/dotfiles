"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const history_1 = require("../commands/history");
const scanner_1 = require("../scanner");
function parseHistoryCommandArgs(input) {
    const args = { type: history_1.HistoryCommandType.Cmd };
    if (input) {
        const scanner = new scanner_1.Scanner(input);
        scanner.skipWhiteSpace();
        const type = scanner.nextWord();
        if (type === '/' || (type.startsWith('s') && 'search'.startsWith(type))) {
            args.type = history_1.HistoryCommandType.Search;
        }
    }
    return new history_1.HistoryCommand(args);
}
exports.parseHistoryCommandArgs = parseHistoryCommandArgs;

//# sourceMappingURL=history.js.map
