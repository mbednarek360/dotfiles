"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logger_1 = require("./logger");
const position_1 = require("../common/motion/position");
const range_1 = require("../common/motion/range");
const child_process_1 = require("child_process");
/**
 * This is certainly quite janky! The problem we're trying to solve
 * is that writing `editor.selection = new Position()` won't immediately
 * update the position of the cursor. So we have to wait!
 */
function waitForCursorSync(timeoutInMilliseconds = 0, rejectOnTimeout = false) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            let timer = setTimeout(rejectOnTimeout ? reject : resolve, timeoutInMilliseconds);
            const disposable = vscode.window.onDidChangeTextEditorSelection(x => {
                disposable.dispose();
                clearTimeout(timer);
                resolve();
            });
        });
    });
}
exports.waitForCursorSync = waitForCursorSync;
function getCursorsAfterSync(timeoutInMilliseconds = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = logger_1.Logger.get('getCursorsAfterSync');
        try {
            yield waitForCursorSync(timeoutInMilliseconds, true);
        }
        catch (e) {
            logger.warn(`getCursorsAfterSync: selection not updated within ${timeoutInMilliseconds}ms.`);
        }
        return vscode.window.activeTextEditor.selections.map(x => new range_1.Range(position_1.Position.FromVSCodePosition(x.start), position_1.Position.FromVSCodePosition(x.end)));
    });
}
exports.getCursorsAfterSync = getCursorsAfterSync;
/**
 * This function executes a shell command and returns the standard output as a string.
 */
function executeShell(cmd) {
    return new Promise((resolve, reject) => {
        try {
            child_process_1.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stdout);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.executeShell = executeShell;
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
exports.clamp = clamp;

//# sourceMappingURL=util.js.map
