"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const position_1 = require("./common/motion/position");
const range_1 = require("./common/motion/range");
const logger_1 = require("./util/logger");
function showInfo(message) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.window.showInformationMessage('Vim: ' + message);
    });
}
exports.showInfo = showInfo;
function showError(message) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.window.showErrorMessage('Vim: ' + message);
    });
}
exports.showError = showError;
const clipboardy = require("clipboardy");
class Clipboard {
    static Copy(text) {
        try {
            clipboardy.writeSync(text);
        }
        catch (e) {
            logger_1.Logger.error(e, `Clipboard: Error copying to clipboard. Error=${e}`);
        }
    }
    static Paste() {
        return clipboardy.readSync();
    }
}
exports.Clipboard = Clipboard;
/**
 * This is certainly quite janky! The problem we're trying to solve
 * is that writing editor.selection = new Position() won't immediately
 * update the position of the cursor. So we have to wait!
 */
function waitForCursorUpdatesToHappen(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
            const disposer = vscode.window.onDidChangeTextEditorSelection(x => {
                disposer.dispose();
                resolve();
            });
        });
    });
}
exports.waitForCursorUpdatesToHappen = waitForCursorUpdatesToHappen;
/**
 * Waits for the tabs to change after a command like 'gt' or 'gT' is run.
 * Sometimes it is not immediate, so we must busy wait
 * On certain versions, the tab changes are synchronous
 * For those, a timeout is given
 */
function waitForTabChange() {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
            const disposer = vscode.window.onDidChangeActiveTextEditor(textEditor => {
                disposer.dispose();
                resolve(textEditor);
            });
        });
    });
}
exports.waitForTabChange = waitForTabChange;
function allowVSCodeToPropagateCursorUpdatesAndReturnThem(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        yield waitForCursorUpdatesToHappen(timeout);
        return vscode.window.activeTextEditor.selections.map(x => new range_1.Range(position_1.Position.FromVSCodePosition(x.start), position_1.Position.FromVSCodePosition(x.end)));
    });
}
exports.allowVSCodeToPropagateCursorUpdatesAndReturnThem = allowVSCodeToPropagateCursorUpdatesAndReturnThem;
function getExternalExtensionDirPath() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const os = require('os');
            const homeDir = os.homedir();
            const path = require('path');
            const extensionFolder = path.join(homeDir, '.VSCodeVim');
            const fs = require('fs');
            fs.mkdir(extensionFolder, 0o775, (err) => {
                if (!err || err.code === 'EEXIST') {
                    resolve(extensionFolder);
                }
                else {
                    logger_1.Logger.debug(err.message);
                    reject(err);
                }
            });
        });
    });
}
exports.getExternalExtensionDirPath = getExternalExtensionDirPath;

//# sourceMappingURL=util.js.map
