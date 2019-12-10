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
const mode_1 = require("../../mode/mode");
const textEditor_1 = require("../../textEditor");
const node = require("../node");
const token = require("../token");
class SortCommand extends node.CommandBase {
    constructor(args) {
        super();
        this._arguments = args;
    }
    get arguments() {
        return this._arguments;
    }
    neovimCapable() {
        return true;
    }
    execute(vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mode_1.isVisualMode(vimState.currentMode)) {
                const selection = vimState.editor.selection;
                let start = selection.start;
                let end = selection.end;
                if (start.isAfter(end)) {
                    [start, end] = [end, start];
                }
                yield this.sortLines(start, end);
            }
            else {
                yield this.sortLines(new vscode.Position(0, 0), new vscode.Position(textEditor_1.TextEditor.getLineCount() - 1, 0));
            }
        });
    }
    sortLines(startLine, endLine) {
        return __awaiter(this, void 0, void 0, function* () {
            let originalLines = [];
            for (let currentLine = startLine.line; currentLine <= endLine.line && currentLine < textEditor_1.TextEditor.getLineCount(); currentLine++) {
                originalLines.push(textEditor_1.TextEditor.readLineAt(currentLine));
            }
            if (this._arguments.unique) {
                originalLines = [...new Set(originalLines)];
            }
            let lastLineLength = originalLines[originalLines.length - 1].length;
            let sortedLines = this._arguments.ignoreCase
                ? originalLines.sort((a, b) => a.localeCompare(b))
                : originalLines.sort();
            if (this._arguments.reverse) {
                sortedLines.reverse();
            }
            let sortedContent = sortedLines.join('\n');
            yield textEditor_1.TextEditor.replace(new vscode.Range(startLine.line, 0, endLine.line, lastLineLength), sortedContent);
        });
    }
    executeWithRange(vimState, range) {
        return __awaiter(this, void 0, void 0, function* () {
            let startLine;
            let endLine;
            if (range.left[0].type === token.TokenType.Percent) {
                startLine = new vscode.Position(0, 0);
                endLine = new vscode.Position(textEditor_1.TextEditor.getLineCount() - 1, 0);
            }
            else {
                startLine = range.lineRefToPosition(vimState.editor, range.left, vimState);
                endLine = range.lineRefToPosition(vimState.editor, range.right, vimState);
            }
            yield this.sortLines(startLine, endLine);
        });
    }
}
exports.SortCommand = SortCommand;

//# sourceMappingURL=sort.js.map
