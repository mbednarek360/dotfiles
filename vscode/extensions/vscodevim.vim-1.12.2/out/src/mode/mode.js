"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const globalState_1 = require("../state/globalState");
const searchState_1 = require("../state/searchState");
const position_1 = require("../common/motion/position");
var Mode;
(function (Mode) {
    Mode[Mode["Normal"] = 0] = "Normal";
    Mode[Mode["Insert"] = 1] = "Insert";
    Mode[Mode["Visual"] = 2] = "Visual";
    Mode[Mode["VisualBlock"] = 3] = "VisualBlock";
    Mode[Mode["VisualLine"] = 4] = "VisualLine";
    Mode[Mode["SearchInProgressMode"] = 5] = "SearchInProgressMode";
    Mode[Mode["CommandlineInProgress"] = 6] = "CommandlineInProgress";
    Mode[Mode["Replace"] = 7] = "Replace";
    Mode[Mode["EasyMotionMode"] = 8] = "EasyMotionMode";
    Mode[Mode["EasyMotionInputMode"] = 9] = "EasyMotionInputMode";
    Mode[Mode["SurroundInputMode"] = 10] = "SurroundInputMode";
    Mode[Mode["Disabled"] = 11] = "Disabled";
})(Mode = exports.Mode || (exports.Mode = {}));
var VSCodeVimCursorType;
(function (VSCodeVimCursorType) {
    VSCodeVimCursorType[VSCodeVimCursorType["Block"] = 0] = "Block";
    VSCodeVimCursorType[VSCodeVimCursorType["Line"] = 1] = "Line";
    VSCodeVimCursorType[VSCodeVimCursorType["LineThin"] = 2] = "LineThin";
    VSCodeVimCursorType[VSCodeVimCursorType["Underline"] = 3] = "Underline";
    VSCodeVimCursorType[VSCodeVimCursorType["TextDecoration"] = 4] = "TextDecoration";
    VSCodeVimCursorType[VSCodeVimCursorType["Native"] = 5] = "Native";
})(VSCodeVimCursorType = exports.VSCodeVimCursorType || (exports.VSCodeVimCursorType = {}));
var VisualBlockInsertionType;
(function (VisualBlockInsertionType) {
    /**
     * Triggered with I
     */
    VisualBlockInsertionType[VisualBlockInsertionType["Insert"] = 0] = "Insert";
    /**
     * Triggered with A
     */
    VisualBlockInsertionType[VisualBlockInsertionType["Append"] = 1] = "Append";
})(VisualBlockInsertionType = exports.VisualBlockInsertionType || (exports.VisualBlockInsertionType = {}));
function isVisualMode(mode) {
    return [Mode.Visual, Mode.VisualLine, Mode.VisualBlock].includes(mode);
}
exports.isVisualMode = isVisualMode;
function statusBarText(vimState) {
    const cursorChar = vimState.recordedState.actionKeys[vimState.recordedState.actionKeys.length - 1] === '<C-r>'
        ? '"'
        : '|';
    switch (vimState.currentMode) {
        case Mode.Normal:
            return '-- NORMAL --';
        case Mode.Insert:
            return '-- INSERT --';
        case Mode.Visual:
            return '-- VISUAL --';
        case Mode.VisualBlock:
            return '-- VISUAL BLOCK --';
        case Mode.VisualLine:
            return '-- VISUAL LINE --';
        case Mode.Replace:
            return '-- REPLACE --';
        case Mode.EasyMotionMode:
            return '-- EASYMOTION --';
        case Mode.EasyMotionInputMode:
            return '-- EASYMOTION INPUT --';
        case Mode.SurroundInputMode:
            return '-- SURROUND INPUT --';
        case Mode.Disabled:
            return '-- VIM: DISABLED --';
        case Mode.SearchInProgressMode:
            if (globalState_1.globalState.searchState === undefined) {
                this._logger.warn(`globalState.searchState is undefined.`);
                return '';
            }
            const leadingChar = globalState_1.globalState.searchState.searchDirection === searchState_1.SearchDirection.Forward ? '/' : '?';
            let searchWithCursor = globalState_1.globalState.searchState.searchString.split('');
            searchWithCursor.splice(vimState.statusBarCursorCharacterPos, 0, cursorChar);
            return `${leadingChar}${searchWithCursor.join('')}`;
        case Mode.CommandlineInProgress:
            let commandWithCursor = vimState.currentCommandlineText.split('');
            commandWithCursor.splice(vimState.statusBarCursorCharacterPos, 0, cursorChar);
            return `:${commandWithCursor.join('')}`;
        default:
            return '';
    }
}
exports.statusBarText = statusBarText;
function statusBarCommandText(vimState) {
    switch (vimState.currentMode) {
        case Mode.SurroundInputMode:
            return vimState.surround && vimState.surround.replacement
                ? vimState.surround.replacement
                : '';
        case Mode.EasyMotionMode:
            return `Target key: ${vimState.easyMotion.accumulation}`;
        case Mode.EasyMotionInputMode:
            if (!vimState.easyMotion) {
                return '';
            }
            const searchCharCount = vimState.easyMotion.searchAction.searchCharCount;
            const message = searchCharCount > 0
                ? `Search for ${searchCharCount} character(s): `
                : 'Search for characters: ';
            return message + vimState.easyMotion.searchAction.getSearchString();
        case Mode.Visual:
            const cmd = vimState.recordedState.commandString;
            // Don't show the `v` that brings you into visual mode
            return cmd.length === 0 || cmd[0] === 'v' ? cmd.slice(1) : cmd;
        case Mode.Normal:
        case Mode.VisualBlock:
        case Mode.VisualLine:
        case Mode.Replace:
        case Mode.Disabled:
            return vimState.recordedState.commandString;
        default:
            return '';
    }
}
exports.statusBarCommandText = statusBarCommandText;
function getCursorStyle(cursorType) {
    switch (cursorType) {
        case VSCodeVimCursorType.Block:
            return vscode.TextEditorCursorStyle.Block;
        case VSCodeVimCursorType.Line:
            return vscode.TextEditorCursorStyle.Line;
        case VSCodeVimCursorType.LineThin:
            return vscode.TextEditorCursorStyle.LineThin;
        case VSCodeVimCursorType.Underline:
            return vscode.TextEditorCursorStyle.Underline;
        case VSCodeVimCursorType.TextDecoration:
            return vscode.TextEditorCursorStyle.LineThin;
        case VSCodeVimCursorType.Native:
        default:
            return vscode.TextEditorCursorStyle.Block;
    }
}
exports.getCursorStyle = getCursorStyle;
function getCursorType(mode) {
    switch (mode) {
        case Mode.Normal:
            return VSCodeVimCursorType.Block;
        case Mode.Insert:
            return VSCodeVimCursorType.Native;
        case Mode.Visual:
            return VSCodeVimCursorType.TextDecoration;
        case Mode.VisualBlock:
            return VSCodeVimCursorType.TextDecoration;
        case Mode.VisualLine:
            return VSCodeVimCursorType.Block;
        case Mode.SearchInProgressMode:
            return VSCodeVimCursorType.Block;
        case Mode.CommandlineInProgress:
            return VSCodeVimCursorType.Block;
        case Mode.Replace:
            return VSCodeVimCursorType.Underline;
        case Mode.EasyMotionMode:
            return VSCodeVimCursorType.Block;
        case Mode.EasyMotionInputMode:
            return VSCodeVimCursorType.Block;
        case Mode.SurroundInputMode:
            return VSCodeVimCursorType.Block;
        case Mode.Disabled:
        default:
            return VSCodeVimCursorType.Line;
    }
}
exports.getCursorType = getCursorType;
function visualBlockGetTopLeftPosition(start, stop) {
    return new position_1.Position(Math.min(start.line, stop.line), Math.min(start.character, stop.character));
}
exports.visualBlockGetTopLeftPosition = visualBlockGetTopLeftPosition;
function visualBlockGetBottomRightPosition(start, stop) {
    return new position_1.Position(Math.max(start.line, stop.line), Math.max(start.character, stop.character));
}
exports.visualBlockGetBottomRightPosition = visualBlockGetBottomRightPosition;

//# sourceMappingURL=mode.js.map
