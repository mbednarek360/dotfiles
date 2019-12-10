"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const modeHandler_1 = require("./../mode/modeHandler");
const searchState_1 = require("./../state/searchState");
const replaceState_1 = require("./../state/replaceState");
const modeVisualBlock_1 = require("./../mode/modeVisualBlock");
const mode_1 = require("./../mode/mode");
const modeVisualBlock_2 = require("./../mode/modeVisualBlock");
const range_1 = require("./../motion/range");
const textEditor_1 = require("./../textEditor");
const register_1 = require("./../register/register");
const numericString_1 = require("./../number/numericString");
const position_1 = require("./../motion/position");
const matcher_1 = require("./../matching/matcher");
const quoteMatcher_1 = require("./../matching/quoteMatcher");
const tagMatcher_1 = require("./../matching/tagMatcher");
const tab_1 = require("./../cmd_line/commands/tab");
const configuration_1 = require("./../configuration/configuration");
const util_1 = require("../util");
const transformations_1 = require("./../transformations/transformations");
const easymotion_1 = require("./../easymotion/easymotion");
const file_1 = require("./../cmd_line/commands/file");
const quit_1 = require("./../cmd_line/commands/quit");
const vscode = require("vscode");
const util = require("./../util");
const is2DArray = function (x) {
    return Array.isArray(x[0]);
};
let compareKeypressSequence = function (one, two) {
    if (is2DArray(one)) {
        for (const sequence of one) {
            if (compareKeypressSequence(sequence, two)) {
                return true;
            }
        }
        return false;
    }
    if (one.length !== two.length) {
        return false;
    }
    const isSingleNumber = (s) => {
        return s.length === 1 && "1234567890".indexOf(s) > -1;
    };
    const containsControlKey = (s) => {
        // We count anything starting with < (e.g. <c-u>) as a control key, but we
        // exclude the first 3 because it's more convenient to do so.
        return s.toUpperCase() !== "<BS>" &&
            s.toUpperCase() !== "<SHIFT+BS>" &&
            s.toUpperCase() !== "<TAB>" &&
            s.startsWith("<") &&
            s.length > 1;
    };
    for (let i = 0, j = 0; i < one.length; i++, j++) {
        const left = one[i], right = two[j];
        if (left === "<any>") {
            continue;
        }
        if (right === "<any>") {
            continue;
        }
        if (left === "<number>" && isSingleNumber(right)) {
            continue;
        }
        if (right === "<number>" && isSingleNumber(left)) {
            continue;
        }
        if (left === "<character>" && !containsControlKey(right)) {
            continue;
        }
        if (right === "<character>" && !containsControlKey(left)) {
            continue;
        }
        if (left === "<leader>" && right === configuration_1.Configuration.leader) {
            continue;
        }
        if (right === "<leader>" && left === configuration_1.Configuration.leader) {
            continue;
        }
        if (left === configuration_1.Configuration.leader) {
            return false;
        }
        if (right === configuration_1.Configuration.leader) {
            return false;
        }
        if (left !== right) {
            return false;
        }
    }
    return true;
};
function isIMovement(o) {
    return o.start !== undefined &&
        o.stop !== undefined;
}
exports.isIMovement = isIMovement;
class BaseAction {
    constructor() {
        /**
         * Can this action be paired with an operator (is it like w in dw)? All
         * BaseMovements can be, and some more sophisticated commands also can be.
         */
        this.isMotion = false;
        this.canBeRepeatedWithDot = false;
        this.mustBeFirstKey = false;
        /**
         * The keys pressed at the time that this action was triggered.
         */
        this.keysPressed = [];
    }
    /**
     * Is this action valid in the current Vim state?
     */
    doesActionApply(vimState, keysPressed) {
        if (this.modes.indexOf(vimState.currentMode) === -1) {
            return false;
        }
        if (!compareKeypressSequence(this.keys, keysPressed)) {
            return false;
        }
        if (vimState.recordedState.actionsRun.length > 0 &&
            this.mustBeFirstKey) {
            return false;
        }
        if (this instanceof BaseOperator && vimState.recordedState.operator) {
            return false;
        }
        return true;
    }
    /**
     * Could the user be in the process of doing this action.
     */
    couldActionApply(vimState, keysPressed) {
        if (this.modes.indexOf(vimState.currentMode) === -1) {
            return false;
        }
        if (!compareKeypressSequence(this.keys.slice(0, keysPressed.length), keysPressed)) {
            return false;
        }
        if (vimState.recordedState.actionsRun.length > 0 &&
            this.mustBeFirstKey) {
            return false;
        }
        if (this instanceof BaseOperator && vimState.recordedState.operator) {
            return false;
        }
        return true;
    }
    toString() {
        return this.keys.join("");
    }
}
exports.BaseAction = BaseAction;
class DocumentContentChangeAction extends BaseAction {
    constructor() {
        super(...arguments);
        this.contentChanges = [];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.contentChanges.length === 0) {
                return vimState;
            }
            let originalLeftBoundary;
            if (this.contentChanges[0].textDiff.text === "" && this.contentChanges[0].textDiff.rangeLength === 1) {
                originalLeftBoundary = this.contentChanges[0].textDiff.range.end;
            }
            else {
                originalLeftBoundary = this.contentChanges[0].textDiff.range.start;
            }
            let rightBoundary = position;
            let newStart;
            let newEnd;
            for (let i = 0; i < this.contentChanges.length; i++) {
                let contentChange = this.contentChanges[i].textDiff;
                if (contentChange.range.start.line < originalLeftBoundary.line) {
                    // This change should be ignored
                    let linesEffected = contentChange.range.end.line - contentChange.range.start.line + 1;
                    let resultLines = contentChange.text.split("\n").length;
                    originalLeftBoundary = originalLeftBoundary.with(originalLeftBoundary.line + resultLines - linesEffected);
                    continue;
                }
                if (contentChange.range.start.line === originalLeftBoundary.line) {
                    newStart = position.with(position.line, position.character + contentChange.range.start.character - originalLeftBoundary.character);
                    if (contentChange.range.end.line === originalLeftBoundary.line) {
                        newEnd = position.with(position.line, position.character + contentChange.range.end.character - originalLeftBoundary.character);
                    }
                    else {
                        newEnd = position.with(position.line + contentChange.range.end.line - originalLeftBoundary.line, contentChange.range.end.character);
                    }
                }
                else {
                    newStart = position.with(position.line + contentChange.range.start.line - originalLeftBoundary.line, contentChange.range.start.character);
                    newEnd = position.with(position.line + contentChange.range.end.line - originalLeftBoundary.line, contentChange.range.end.character);
                }
                if (newStart.isAfter(rightBoundary)) {
                    // This change should be ignored as it's out of boundary
                    continue;
                }
                // Calculate new right boundary
                let newLineCount = contentChange.text.split('\n').length;
                let newRightBoundary;
                if (newLineCount === 1) {
                    newRightBoundary = newStart.with(newStart.line, newStart.character + contentChange.text.length);
                }
                else {
                    newRightBoundary = new vscode.Position(newStart.line + newLineCount - 1, contentChange.text.split('\n').pop().length);
                }
                if (newRightBoundary.isAfter(rightBoundary)) {
                    rightBoundary = newRightBoundary;
                }
                vimState.editor.selection = new vscode.Selection(newStart, newEnd);
                if (newStart.isEqual(newEnd)) {
                    yield textEditor_1.TextEditor.insert(contentChange.text, position_1.Position.FromVSCodePosition(newStart));
                }
                else {
                    yield textEditor_1.TextEditor.replace(vimState.editor.selection, contentChange.text);
                }
            }
            /**
             * We're making an assumption here that content changes are always in order, and I'm not sure
             * we're guaranteed that, but it seems to work well enough in practice.
             */
            if (newStart && newEnd) {
                const last = this.contentChanges[this.contentChanges.length - 1];
                vimState.cursorStartPosition = position_1.Position.FromVSCodePosition(newStart)
                    .advancePositionByText(last.textDiff.text)
                    .add(last.positionDiff);
                vimState.cursorPosition = position_1.Position.FromVSCodePosition(newEnd)
                    .advancePositionByText(last.textDiff.text)
                    .add(last.positionDiff);
            }
            vimState.currentMode = mode_1.ModeName.Insert;
            return vimState;
        });
    }
}
exports.DocumentContentChangeAction = DocumentContentChangeAction;
/**
 * A movement is something like 'h', 'k', 'w', 'b', 'gg', etc.
 */
class BaseMovement extends BaseAction {
    constructor() {
        super(...arguments);
        this.modes = [
            mode_1.ModeName.Normal,
            mode_1.ModeName.Visual,
            mode_1.ModeName.VisualLine,
            mode_1.ModeName.VisualBlock,
        ];
        this.isMotion = true;
        this.canBePrefixedWithCount = false;
        /**
         * Whether we should change desiredColumn in VimState.
         */
        this.doesntChangeDesiredColumn = false;
        /**
         * This is for commands like $ which force the desired column to be at
         * the end of even the longest line.
         */
        this.setsDesiredColumnToEOL = false;
    }
    /**
     * Whether we should change lastRepeatableMovement in VimState.
     */
    canBeRepeatedWithSemicolon(vimState, result) {
        return false;
    }
    /**
     * Run the movement a single time.
     *
     * Generally returns a new Position. If necessary, it can return an IMovement instead.
     */
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Not implemented!");
        });
    }
    /**
     * Run the movement in an operator context a single time.
     *
     * Some movements operate over different ranges when used for operators.
     */
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.execAction(position, vimState);
        });
    }
    /**
     * Run a movement count times.
     *
     * count: the number prefix the user entered, or 0 if they didn't enter one.
     */
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let recordedState = vimState.recordedState;
            let result = new position_1.Position(0, 0); // bogus init to satisfy typechecker
            if (count < 1) {
                count = 1;
            }
            else if (count > 99999) {
                count = 99999;
            }
            for (let i = 0; i < count; i++) {
                const firstIteration = (i === 0);
                const lastIteration = (i === count - 1);
                const temporaryResult = (recordedState.operator && lastIteration) ?
                    yield this.execActionForOperator(position, vimState) :
                    yield this.execAction(position, vimState);
                if (temporaryResult instanceof position_1.Position) {
                    result = temporaryResult;
                    position = temporaryResult;
                }
                else if (isIMovement(temporaryResult)) {
                    if (result instanceof position_1.Position) {
                        result = {
                            start: new position_1.Position(0, 0),
                            stop: new position_1.Position(0, 0),
                            failed: false
                        };
                    }
                    result.failed = result.failed || temporaryResult.failed;
                    if (firstIteration) {
                        result.start = temporaryResult.start;
                    }
                    if (lastIteration) {
                        result.stop = temporaryResult.stop;
                    }
                    else {
                        position = temporaryResult.stop.getRightThroughLineBreaks();
                    }
                }
            }
            return result;
        });
    }
}
exports.BaseMovement = BaseMovement;
/**
 * A command is something like <Esc>, :, v, i, etc.
 */
class BaseCommand extends BaseAction {
    constructor() {
        super(...arguments);
        /**
         * If isCompleteAction is true, then triggering this command is a complete action -
         * that means that we'll go and try to run it.
         */
        this.isCompleteAction = true;
        this.multicursorIndex = undefined;
        /**
         * If true, exec() will get called N times where N is the count.
         *
         * If false, exec() will only be called once, and you are expected to
         * handle count prefixes (e.g. the 3 in 3w) yourself.
         */
        this.runsOnceForEachCountPrefix = false;
        this.canBeRepeatedWithDot = false;
    }
    /**
     * In multi-cursor mode, do we run this command for every cursor, or just once?
     */
    runsOnceForEveryCursor() {
        return true;
    }
    /**
     * Run the command a single time.
     */
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Not implemented!");
        });
    }
    /**
     * Run the command the number of times VimState wants us to.
     */
    execCount(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.runsOnceForEveryCursor()) {
                let timesToRepeat = this.runsOnceForEachCountPrefix ? vimState.recordedState.count || 1 : 1;
                for (let i = 0; i < timesToRepeat; i++) {
                    vimState = yield this.exec(position, vimState);
                }
                for (const transformation of vimState.recordedState.transformations) {
                    if (transformations_1.isTextTransformation(transformation) && transformation.cursorIndex === undefined) {
                        transformation.cursorIndex = 0;
                    }
                }
                return vimState;
            }
            let timesToRepeat = this.runsOnceForEachCountPrefix ? vimState.recordedState.count || 1 : 1;
            let resultingCursors = [];
            let i = 0;
            const cursorsToIterateOver = vimState.allCursors
                .map(x => new range_1.Range(x.start, x.stop))
                .sort((a, b) => a.start.line > b.start.line || (a.start.line === b.start.line && a.start.character > b.start.character) ? 1 : -1);
            for (const { start, stop } of cursorsToIterateOver) {
                this.multicursorIndex = i++;
                vimState.cursorPosition = stop;
                vimState.cursorStartPosition = start;
                for (let j = 0; j < timesToRepeat; j++) {
                    vimState = yield this.exec(stop, vimState);
                }
                resultingCursors.push(new range_1.Range(vimState.cursorStartPosition, vimState.cursorPosition));
                for (const transformation of vimState.recordedState.transformations) {
                    if (transformations_1.isTextTransformation(transformation) && transformation.cursorIndex === undefined) {
                        transformation.cursorIndex = this.multicursorIndex;
                    }
                }
            }
            vimState.allCursors = resultingCursors;
            return vimState;
        });
    }
}
exports.BaseCommand = BaseCommand;
class BaseOperator extends BaseAction {
    constructor(multicursorIndex) {
        super();
        this.canBeRepeatedWithDot = true;
        /**
         * If this is being run in multi cursor mode, the index of the cursor
         * this operator is being applied to.
         */
        this.multicursorIndex = undefined;
        this.multicursorIndex = multicursorIndex;
    }
    /**
     * Run this operator on a range, returning the new location of the cursor.
     */
    run(vimState, start, stop) {
        throw new Error("You need to override this!");
    }
}
exports.BaseOperator = BaseOperator;
var KeypressState;
(function (KeypressState) {
    KeypressState[KeypressState["WaitingOnKeys"] = 0] = "WaitingOnKeys";
    KeypressState[KeypressState["NoPossibleMatch"] = 1] = "NoPossibleMatch";
})(KeypressState = exports.KeypressState || (exports.KeypressState = {}));
class Actions {
    /**
     * Gets the action that should be triggered given a key
     * sequence.
     *
     * If there is a definitive action that matched, returns that action.
     *
     * If an action could potentially match if more keys were to be pressed, returns true. (e.g.
     * you pressed "g" and are about to press "g" action to make the full action "gg".)
     *
     * If no action could ever match, returns false.
     */
    static getRelevantAction(keysPressed, vimState) {
        let couldPotentiallyHaveMatch = false;
        for (const thing of Actions.allActions) {
            const { type, action } = thing;
            if (action.doesActionApply(vimState, keysPressed)) {
                const result = new type();
                result.keysPressed = vimState.recordedState.actionKeys.slice(0);
                return result;
            }
            if (action.couldActionApply(vimState, keysPressed)) {
                couldPotentiallyHaveMatch = true;
            }
        }
        return couldPotentiallyHaveMatch ? KeypressState.WaitingOnKeys : KeypressState.NoPossibleMatch;
    }
}
/**
 * Every Vim action will be added here with the @RegisterAction decorator.
 */
Actions.allActions = [];
exports.Actions = Actions;
function RegisterAction(action) {
    Actions.allActions.push({ type: action, action: new action() });
}
exports.RegisterAction = RegisterAction;
// begin actions
let CommandInsertInInsertMode = class CommandInsertInInsertMode extends BaseCommand {
    // begin actions
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<character>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const char = this.keysPressed[this.keysPressed.length - 1];
            const line = textEditor_1.TextEditor.getLineAt(position).text;
            if (char === "<BS>") {
                const selection = textEditor_1.TextEditor.getSelection();
                // Check if a selection is active
                if (!selection.isEmpty) {
                    vimState.recordedState.transformations.push({
                        type: "deleteRange",
                        range: new range_1.Range(selection.start, selection.end),
                    });
                }
                else {
                    if (line.length > 0 && line.match(/^\s+$/) && configuration_1.Configuration.expandtab) {
                        // If the line is empty except whitespace, backspace should return to
                        // the next lowest level of indentation.
                        const tabSize = vimState.editor.options.tabSize;
                        const desiredLineLength = Math.floor((position.character - 1) / tabSize) * tabSize;
                        vimState.recordedState.transformations.push({
                            type: "deleteRange",
                            range: new range_1.Range(new position_1.Position(position.line, desiredLineLength), new position_1.Position(position.line, line.length))
                        });
                    }
                    else {
                        if (position.line !== 0 || position.character !== 0) {
                            vimState.recordedState.transformations.push({
                                type: "deleteText",
                                position: position,
                            });
                        }
                    }
                }
                vimState.cursorPosition = vimState.cursorPosition.getLeft();
                vimState.cursorStartPosition = vimState.cursorStartPosition.getLeft();
            }
            else {
                if (vimState.isMultiCursor) {
                    vimState.recordedState.transformations.push({
                        type: "insertText",
                        text: char,
                        position: vimState.cursorPosition,
                    });
                }
                else {
                    vimState.recordedState.transformations.push({
                        type: "insertTextVSCode",
                        text: char,
                    });
                }
            }
            return vimState;
        });
    }
    toString() {
        return this.keysPressed[this.keysPressed.length - 1];
    }
};
CommandInsertInInsertMode = __decorate([
    RegisterAction
], CommandInsertInInsertMode);
exports.CommandInsertInInsertMode = CommandInsertInInsertMode;
let CommandNumber = class CommandNumber extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<number>"];
        this.isCompleteAction = false;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const number = parseInt(this.keysPressed[0], 10);
            vimState.recordedState.count = vimState.recordedState.count * 10 + number;
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const isZero = keysPressed[0] === "0";
        return super.doesActionApply(vimState, keysPressed) &&
            ((isZero && vimState.recordedState.count > 0) || !isZero);
    }
    couldActionApply(vimState, keysPressed) {
        const isZero = keysPressed[0] === "0";
        return super.couldActionApply(vimState, keysPressed) &&
            ((isZero && vimState.recordedState.count > 0) || !isZero);
    }
};
CommandNumber = __decorate([
    RegisterAction
], CommandNumber);
let CommandRegister = class CommandRegister extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["\"", "<character>"];
        this.isCompleteAction = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const register = this.keysPressed[1];
            vimState.recordedState.registerName = register;
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.doesActionApply(vimState, keysPressed) && register_1.Register.isValidRegister(register);
    }
    couldActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.couldActionApply(vimState, keysPressed) && register_1.Register.isValidRegister(register);
    }
};
CommandRegister = __decorate([
    RegisterAction
], CommandRegister);
exports.CommandRegister = CommandRegister;
let CommandInsertRegisterContent = class CommandInsertRegisterContent extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-r>", "<character>"];
        this.isCompleteAction = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.recordedState.registerName = this.keysPressed[1];
            const register = yield register_1.Register.get(vimState);
            let text;
            if (register.text instanceof Array) {
                text = register.text.join("\n");
            }
            else if (register.text instanceof modeHandler_1.RecordedState) {
                vimState.recordedState.transformations.push({
                    type: "macro",
                    register: vimState.recordedState.registerName,
                    replay: "keystrokes"
                });
                return vimState;
            }
            else {
                text = register.text;
            }
            if (register.registerMode === register_1.RegisterMode.LineWise) {
                text += "\n";
            }
            yield textEditor_1.TextEditor.insertAt(text, position);
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.cursorStartPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.doesActionApply(vimState, keysPressed) && register_1.Register.isValidRegister(register);
    }
    couldActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.couldActionApply(vimState, keysPressed) && register_1.Register.isValidRegister(register);
    }
};
CommandInsertRegisterContent = __decorate([
    RegisterAction
], CommandInsertRegisterContent);
let CommandOneNormalCommandInInsertMode = class CommandOneNormalCommandInInsertMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-o>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.returnToInsertAfterCommand = true;
            return yield new CommandEscInsertMode().exec(position.character === 0 ? position : position.getRight(), vimState);
        });
    }
};
CommandOneNormalCommandInInsertMode = __decorate([
    RegisterAction
], CommandOneNormalCommandInInsertMode);
exports.CommandOneNormalCommandInInsertMode = CommandOneNormalCommandInInsertMode;
let CommandInsertRegisterContentInSearchMode = class CommandInsertRegisterContentInSearchMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SearchInProgressMode];
        this.keys = ["<C-r>", "<character>"];
        this.isCompleteAction = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.recordedState.registerName = this.keysPressed[1];
            const register = yield register_1.Register.get(vimState);
            let text;
            if (register.text instanceof Array) {
                text = register.text.join("\n");
            }
            else if (register.text instanceof modeHandler_1.RecordedState) {
                let keyStrokes = [];
                for (let action of register.text.actionsRun) {
                    keyStrokes = keyStrokes.concat(action.keysPressed);
                }
                text = keyStrokes.join("\n");
            }
            else {
                text = register.text;
            }
            if (register.registerMode === register_1.RegisterMode.LineWise) {
                text += "\n";
            }
            const searchState = vimState.globalState.searchState;
            searchState.searchString += text;
            return vimState;
        });
    }
};
CommandInsertRegisterContentInSearchMode = __decorate([
    RegisterAction
], CommandInsertRegisterContentInSearchMode);
let CommandRecordMacro = class CommandRecordMacro extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["q", "<character>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const register = this.keysPressed[1];
            vimState.recordedMacro = new modeHandler_1.RecordedState();
            vimState.recordedMacro.registerName = register.toLocaleLowerCase();
            if (!/^[A-Z]+$/.test(register) || !register_1.Register.has(register)) {
                // If register name is upper case, it means we are appending commands to existing register instead of overriding.
                let newRegister = new modeHandler_1.RecordedState();
                newRegister.registerName = register;
                register_1.Register.putByKey(newRegister, register);
            }
            vimState.isRecordingMacro = true;
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const register = this.keysPressed[1];
        return super.doesActionApply(vimState, keysPressed) && register_1.Register.isValidRegisterForMacro(register);
    }
    couldActionApply(vimState, keysPressed) {
        const register = this.keysPressed[1];
        return super.couldActionApply(vimState, keysPressed) && register_1.Register.isValidRegisterForMacro(register);
    }
};
CommandRecordMacro = __decorate([
    RegisterAction
], CommandRecordMacro);
let CommandQuitRecordMacro = class CommandQuitRecordMacro extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["q"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingMacro = (yield register_1.Register.getByKey(vimState.recordedMacro.registerName)).text;
            existingMacro.actionsRun = existingMacro.actionsRun.concat(vimState.recordedMacro.actionsRun);
            vimState.isRecordingMacro = false;
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) && vimState.isRecordingMacro;
    }
    couldActionApply(vimState, keysPressed) {
        return super.couldActionApply(vimState, keysPressed) && vimState.isRecordingMacro;
    }
};
CommandQuitRecordMacro = __decorate([
    RegisterAction
], CommandQuitRecordMacro);
exports.CommandQuitRecordMacro = CommandQuitRecordMacro;
let CommandExecuteMacro = class CommandExecuteMacro extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["@", "<character>"];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const register = this.keysPressed[1];
            vimState.recordedState.transformations.push({
                type: "macro",
                register: register,
                replay: "contentChange"
            });
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.doesActionApply(vimState, keysPressed) && register_1.Register.isValidRegisterForMacro(register);
    }
    couldActionApply(vimState, keysPressed) {
        const register = keysPressed[1];
        return super.couldActionApply(vimState, keysPressed) && register_1.Register.isValidRegisterForMacro(register);
    }
};
CommandExecuteMacro = __decorate([
    RegisterAction
], CommandExecuteMacro);
let CommandExecuteLastMacro = class CommandExecuteLastMacro extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["@", "@"];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastInvokedMacro = vimState.historyTracker.lastInvokedMacro;
            if (lastInvokedMacro) {
                vimState.recordedState.transformations.push({
                    type: "macro",
                    register: lastInvokedMacro.registerName,
                    replay: "contentChange"
                });
            }
            return vimState;
        });
    }
};
CommandExecuteLastMacro = __decorate([
    RegisterAction
], CommandExecuteLastMacro);
let CommandEsc = class CommandEsc extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [
            mode_1.ModeName.Visual,
            mode_1.ModeName.VisualLine,
            mode_1.ModeName.VisualBlockInsertMode,
            mode_1.ModeName.VisualBlock,
            mode_1.ModeName.Normal,
            mode_1.ModeName.SearchInProgressMode,
            mode_1.ModeName.SurroundInputMode,
            mode_1.ModeName.EasyMotionMode
        ];
        this.keys = [
            ["<Esc>"],
            ["<C-c>"],
            ["<C-[>"],
        ];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vimState.currentMode === mode_1.ModeName.Normal && !vimState.isMultiCursor) {
                return vimState;
            }
            if (vimState.currentMode !== mode_1.ModeName.Visual &&
                vimState.currentMode !== mode_1.ModeName.VisualLine &&
                vimState.currentMode !== mode_1.ModeName.EasyMotionMode) {
                // Normally, you don't have to iterate over all cursors,
                // as that is handled for you by the state machine. ESC is
                // a special case since runsOnceForEveryCursor is false.
                for (let i = 0; i < vimState.allCursors.length; i++) {
                    vimState.allCursors[i] = vimState.allCursors[i].withNewStop(vimState.allCursors[i].stop.getLeft());
                }
            }
            if (vimState.currentMode === mode_1.ModeName.SearchInProgressMode) {
                if (vimState.globalState.searchState) {
                    vimState.cursorPosition = vimState.globalState.searchState.searchCursorStartPosition;
                }
            }
            if (vimState.currentMode === mode_1.ModeName.Normal && vimState.isMultiCursor) {
                vimState.isMultiCursor = false;
            }
            if (vimState.currentMode === mode_1.ModeName.EasyMotionMode) {
                // Escape or other termination keys were pressed, exit mode
                vimState.easyMotion.clearDecorations();
                vimState.currentMode = mode_1.ModeName.Normal;
            }
            // Abort surround operation
            if (vimState.currentMode === mode_1.ModeName.SurroundInputMode) {
                vimState.surround = undefined;
            }
            vimState.currentMode = mode_1.ModeName.Normal;
            if (!vimState.isMultiCursor) {
                vimState.allCursors = [vimState.allCursors[0]];
            }
            return vimState;
        });
    }
};
CommandEsc = __decorate([
    RegisterAction
], CommandEsc);
let CommandEscInsertMode = class CommandEscInsertMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [
            mode_1.ModeName.Insert
        ];
        this.keys = [
            ["<Esc>"],
            ["<C-c>"],
            ["<C-[>"],
        ];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.cursorPosition = position.getLeft();
            // only remove leading spaces inserted by vscode.
            // vscode only inserts them when user enter a new line,
            // ie, o/O in Normal mode or \n in Insert mode.
            const lastActionBeforeEsc = vimState.keyHistory[vimState.keyHistory.length - 2];
            if (['o', 'O', '\n'].indexOf(lastActionBeforeEsc) > -1 &&
                vimState.editor.document.languageId !== 'plaintext' &&
                /^\s+$/.test(textEditor_1.TextEditor.getLineAt(position).text)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(position.getLineBegin(), position.getLineEnd())
                });
                vimState.cursorPosition = position.getLineBegin();
            }
            vimState.currentMode = mode_1.ModeName.Normal;
            // If we wanted to repeat this insert (only for i and a), now is the time to do it. Insert
            // count amount of these strings before returning back to normal mode
            const typeOfInsert = vimState.recordedState.actionsRun[vimState.recordedState.actionsRun.length - 3];
            if (vimState.recordedState.count > 1 &&
                (typeOfInsert instanceof CommandInsertAtCursor || typeOfInsert instanceof CommandInsertAfterCursor)) {
                const changeAction = vimState.recordedState.actionsRun[vimState.recordedState.actionsRun.length - 2];
                const changesArray = changeAction.contentChanges;
                let docChanges = [];
                for (let i = 0; i < changesArray.length; i++) {
                    docChanges.push(changesArray[i].textDiff);
                }
                let positionDiff = new position_1.PositionDiff(0, 0);
                // Add count amount of inserts in the case of 4i=<esc>
                for (let i = 0; i < (vimState.recordedState.count - 1); i++) {
                    // If this is the last transform, move cursor back one character
                    if (i === (vimState.recordedState.count - 2)) {
                        positionDiff = new position_1.PositionDiff(0, -1);
                    }
                    // Add a transform containing the change
                    vimState.recordedState.transformations.push({
                        type: "contentChange",
                        changes: docChanges,
                        diff: positionDiff
                    });
                }
            }
            if (vimState.historyTracker.currentContentChanges.length > 0) {
                vimState.historyTracker.lastContentChanges = vimState.historyTracker.currentContentChanges;
                vimState.historyTracker.currentContentChanges = [];
            }
            return vimState;
        });
    }
};
CommandEscInsertMode = __decorate([
    RegisterAction
], CommandEscInsertMode);
let CommandEscReplaceMode = class CommandEscReplaceMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Replace];
        this.keys = [
            ["<Esc>"],
            ["<C-c>"],
        ];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const timesToRepeat = vimState.replaceState.timesToRepeat;
            let textToAdd = "";
            for (let i = 1; i < timesToRepeat; i++) {
                textToAdd += vimState.replaceState.newChars.join("");
            }
            vimState.recordedState.transformations.push({
                type: "insertText",
                text: textToAdd,
                position: position,
                diff: new position_1.PositionDiff(0, -1),
            });
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommandEscReplaceMode = __decorate([
    RegisterAction
], CommandEscReplaceMode);
let CommandCtrlOpenBracket = class CommandCtrlOpenBracket extends CommandEsc {
    constructor() {
        super(...arguments);
        this.modes = [
            mode_1.ModeName.Insert,
            mode_1.ModeName.Visual,
            mode_1.ModeName.VisualLine,
            mode_1.ModeName.VisualBlockInsertMode,
            mode_1.ModeName.VisualBlock,
            mode_1.ModeName.Replace
        ];
        this.keys = [["<C-[>"]];
    }
};
CommandCtrlOpenBracket = __decorate([
    RegisterAction
], CommandCtrlOpenBracket);
let CommandCtrlW = class CommandCtrlW extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-w>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let wordBegin;
            if (position.isInLeadingWhitespace()) {
                wordBegin = position.getLineBegin();
            }
            else if (position.isLineBeginning()) {
                wordBegin = position.getPreviousLineBegin().getLineEnd();
            }
            else {
                wordBegin = position.getWordLeft();
            }
            yield textEditor_1.TextEditor.delete(new vscode.Range(wordBegin, position));
            vimState.cursorPosition = wordBegin;
            return vimState;
        });
    }
};
CommandCtrlW = __decorate([
    RegisterAction
], CommandCtrlW);
class CommandEditorScroll extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.runsOnceForEachCountPrefix = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            vimState.postponedCodeViewChanges.push({
                command: "editorScroll",
                args: {
                    to: this.to,
                    by: this.by,
                    value: timesToRepeat,
                    revealCursor: true
                }
            });
            return vimState;
        });
    }
}
let CommandInsertPreviousText = class CommandInsertPreviousText extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-a>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let actions = (yield register_1.Register.getByKey('.')).text.actionsRun.slice(0);
            // let actions = Register.lastContentChange.actionsRun.slice(0);
            // The first action is entering Insert Mode, which is not necessary in this case
            actions.shift();
            // The last action is leaving Insert Mode, which is not necessary in this case
            // actions.pop();
            if (actions.length > 0 && actions[0] instanceof ArrowsInInsertMode) {
                // Note, arrow keys are the only Insert action command that can't be repeated here as far as @rebornix knows.
                actions.shift();
            }
            for (let action of actions) {
                if (action instanceof BaseCommand) {
                    vimState = yield action.execCount(vimState.cursorPosition, vimState);
                }
                if (action instanceof DocumentContentChangeAction) {
                    vimState = yield action.exec(vimState.cursorPosition, vimState);
                }
            }
            vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.end);
            vimState.cursorStartPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            vimState.currentMode = mode_1.ModeName.Insert;
            return vimState;
        });
    }
};
CommandInsertPreviousText = __decorate([
    RegisterAction
], CommandInsertPreviousText);
exports.CommandInsertPreviousText = CommandInsertPreviousText;
let CommandInsertPreviousTextAndQuit = class CommandInsertPreviousTextAndQuit extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-shift+2>"]; // <C-@>
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState = yield new CommandInsertPreviousText().exec(position, vimState);
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommandInsertPreviousTextAndQuit = __decorate([
    RegisterAction
], CommandInsertPreviousTextAndQuit);
let CommandInsertBelowChar = class CommandInsertBelowChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-e>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (textEditor_1.TextEditor.isLastLine(position)) {
                return vimState;
            }
            const charBelowCursorPosition = position.getDownByCount(1);
            if (charBelowCursorPosition.isLineEnd()) {
                return vimState;
            }
            const char = textEditor_1.TextEditor.getText(new vscode.Range(charBelowCursorPosition, charBelowCursorPosition.getRight()));
            yield textEditor_1.TextEditor.insert(char, position);
            vimState.cursorStartPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            return vimState;
        });
    }
};
CommandInsertBelowChar = __decorate([
    RegisterAction
], CommandInsertBelowChar);
let CommandInsertIndentInCurrentLine = class CommandInsertIndentInCurrentLine extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-t>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalText = textEditor_1.TextEditor.getLineAt(position).text;
            const indentationWidth = textEditor_1.TextEditor.getIndentationLevel(originalText);
            const tabSize = configuration_1.Configuration.tabstop || Number(vimState.editor.options.tabSize);
            const newIndentationWidth = (indentationWidth / tabSize + 1) * tabSize;
            textEditor_1.TextEditor.replaceText(vimState, textEditor_1.TextEditor.setIndentationLevel(originalText, newIndentationWidth), position.getLineBegin(), position.getLineEnd(), new position_1.PositionDiff(0, newIndentationWidth - indentationWidth));
            return vimState;
        });
    }
};
CommandInsertIndentInCurrentLine = __decorate([
    RegisterAction
], CommandInsertIndentInCurrentLine);
let CommandDeleteIndentInCurrentLine = class CommandDeleteIndentInCurrentLine extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-d>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalText = textEditor_1.TextEditor.getLineAt(position).text;
            const indentationWidth = textEditor_1.TextEditor.getIndentationLevel(originalText);
            if (indentationWidth === 0) {
                return vimState;
            }
            const tabSize = configuration_1.Configuration.tabstop;
            const newIndentationWidth = (indentationWidth / tabSize - 1) * tabSize;
            yield textEditor_1.TextEditor.replace(new vscode.Range(position.getLineBegin(), position.getLineEnd()), textEditor_1.TextEditor.setIndentationLevel(originalText, newIndentationWidth < 0 ? 0 : newIndentationWidth));
            const cursorPosition = position_1.Position.FromVSCodePosition(position.with(position.line, position.character + (newIndentationWidth - indentationWidth) / tabSize));
            vimState.cursorPosition = cursorPosition;
            vimState.cursorStartPosition = cursorPosition;
            vimState.currentMode = mode_1.ModeName.Insert;
            return vimState;
        });
    }
};
CommandDeleteIndentInCurrentLine = __decorate([
    RegisterAction
], CommandDeleteIndentInCurrentLine);
let CommandCtrlE = class CommandCtrlE extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.keys = ["<C-e>"];
        this.to = "down";
        this.by = "line";
    }
};
CommandCtrlE = __decorate([
    RegisterAction
], CommandCtrlE);
let CommandCtrlY = class CommandCtrlY extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.keys = ["<C-y>"];
        this.to = "up";
        this.by = "line";
    }
};
CommandCtrlY = __decorate([
    RegisterAction
], CommandCtrlY);
let CommandMoveFullPageUp = class CommandMoveFullPageUp extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<C-b>"];
        this.to = "up";
        this.by = "page";
    }
};
CommandMoveFullPageUp = __decorate([
    RegisterAction
], CommandMoveFullPageUp);
let CommandMoveFullPageDown = class CommandMoveFullPageDown extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<C-f>"];
        this.to = "down";
        this.by = "page";
    }
};
CommandMoveFullPageDown = __decorate([
    RegisterAction
], CommandMoveFullPageDown);
let CommandMoveHalfPageDown = class CommandMoveHalfPageDown extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<C-d>"];
        this.to = "down";
        this.by = "halfPage";
    }
};
CommandMoveHalfPageDown = __decorate([
    RegisterAction
], CommandMoveHalfPageDown);
let CommandMoveHalfPageUp = class CommandMoveHalfPageUp extends CommandEditorScroll {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<C-u>"];
        this.to = "up";
        this.by = "halfPage";
    }
};
CommandMoveHalfPageUp = __decorate([
    RegisterAction
], CommandMoveHalfPageUp);
let CommandInsertAboveChar = class CommandInsertAboveChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-y>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (textEditor_1.TextEditor.isFirstLine(position)) {
                return vimState;
            }
            const charAboveCursorPosition = position.getUpByCount(1);
            if (charAboveCursorPosition.isLineEnd()) {
                return vimState;
            }
            const char = textEditor_1.TextEditor.getText(new vscode.Range(charAboveCursorPosition, charAboveCursorPosition.getRight()));
            yield textEditor_1.TextEditor.insert(char, position);
            vimState.cursorStartPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            return vimState;
        });
    }
};
CommandInsertAboveChar = __decorate([
    RegisterAction
], CommandInsertAboveChar);
let CommandInsertAtCursor = class CommandInsertAtCursor extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["i"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        // Only allow this command to be prefixed with a count or nothing, no other
        // actions or operators before
        let previousActionsNumbers = true;
        for (const prevAction of vimState.recordedState.actionsRun) {
            if (!(prevAction instanceof CommandNumber)) {
                previousActionsNumbers = false;
                break;
            }
        }
        if (vimState.recordedState.actionsRun.length === 0 || previousActionsNumbers) {
            return super.couldActionApply(vimState, keysPressed);
        }
        return false;
    }
};
CommandInsertAtCursor = __decorate([
    RegisterAction
], CommandInsertAtCursor);
let CommandReplaceAtCursor = class CommandReplaceAtCursor extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["R"];
        this.runsOnceForEachCountPrefix = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            vimState.currentMode = mode_1.ModeName.Replace;
            vimState.replaceState = new replaceState_1.ReplaceState(position, timesToRepeat);
            return vimState;
        });
    }
};
CommandReplaceAtCursor = __decorate([
    RegisterAction
], CommandReplaceAtCursor);
let CommandReplaceInReplaceMode = class CommandReplaceInReplaceMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Replace];
        this.keys = ["<character>"];
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const char = this.keysPressed[0];
            const replaceState = vimState.replaceState;
            if (char === "<BS>") {
                if (position.isBeforeOrEqual(replaceState.replaceCursorStartPosition)) {
                    // If you backspace before the beginning of where you started to replace,
                    // just move the cursor back.
                    vimState.cursorPosition = position.getLeft();
                    vimState.cursorStartPosition = position.getLeft();
                }
                else if (position.line > replaceState.replaceCursorStartPosition.line ||
                    position.character > replaceState.originalChars.length) {
                    vimState.recordedState.transformations.push({
                        type: "deleteText",
                        position: position,
                    });
                }
                else {
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: replaceState.originalChars[position.character - 1],
                        start: position.getLeft(),
                        end: position,
                        diff: new position_1.PositionDiff(0, -1),
                    });
                }
                replaceState.newChars.pop();
            }
            else {
                if (!position.isLineEnd() && char !== "\n") {
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: char,
                        start: position,
                        end: position.getRight(),
                        diff: new position_1.PositionDiff(0, 1),
                    });
                }
                else {
                    vimState.recordedState.transformations.push({
                        type: "insertText",
                        text: char,
                        position: position,
                    });
                }
                replaceState.newChars.push(char);
            }
            vimState.currentMode = mode_1.ModeName.Replace;
            return vimState;
        });
    }
};
CommandReplaceInReplaceMode = __decorate([
    RegisterAction
], CommandReplaceInReplaceMode);
let ArrowsInReplaceMode = class ArrowsInReplaceMode extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Replace];
        this.keys = [
            ["<up>"],
            ["<down>"],
            ["<left>"],
            ["<right>"],
        ];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPosition = position;
            switch (this.keysPressed[0]) {
                case "<up>":
                    newPosition = yield new MoveUpArrow().execAction(position, vimState);
                    break;
                case "<down>":
                    newPosition = yield new MoveDownArrow().execAction(position, vimState);
                    break;
                case "<left>":
                    newPosition = yield new MoveLeftArrow().execAction(position, vimState);
                    break;
                case "<right>":
                    newPosition = yield new MoveRightArrow().execAction(position, vimState);
                    break;
                default:
                    break;
            }
            vimState.replaceState = new replaceState_1.ReplaceState(newPosition);
            return newPosition;
        });
    }
};
ArrowsInReplaceMode = __decorate([
    RegisterAction
], ArrowsInReplaceMode);
let UpArrowInReplaceMode = class UpArrowInReplaceMode extends ArrowsInReplaceMode {
    constructor() {
        super(...arguments);
        this.keys = [["<up>"]];
    }
};
UpArrowInReplaceMode = __decorate([
    RegisterAction
], UpArrowInReplaceMode);
let DownArrowInReplaceMode = class DownArrowInReplaceMode extends ArrowsInReplaceMode {
    constructor() {
        super(...arguments);
        this.keys = [["<down>"]];
    }
};
DownArrowInReplaceMode = __decorate([
    RegisterAction
], DownArrowInReplaceMode);
let LeftArrowInReplaceMode = class LeftArrowInReplaceMode extends ArrowsInReplaceMode {
    constructor() {
        super(...arguments);
        this.keys = [["<left>"]];
    }
};
LeftArrowInReplaceMode = __decorate([
    RegisterAction
], LeftArrowInReplaceMode);
let RightArrowInReplaceMode = class RightArrowInReplaceMode extends ArrowsInReplaceMode {
    constructor() {
        super(...arguments);
        this.keys = [["<right>"]];
    }
};
RightArrowInReplaceMode = __decorate([
    RegisterAction
], RightArrowInReplaceMode);
class ArrowsInInsertMode extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.canBePrefixedWithCount = true;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // we are in Insert Mode and arrow keys will clear all other actions except the first action, which enters Insert Mode.
            // Please note the arrow key movement can be repeated while using `.` but it can't be repeated when using `<C-A>` in Insert Mode.
            vimState.recordedState.actionsRun = [vimState.recordedState.actionsRun.shift(), vimState.recordedState.actionsRun.pop()];
            let newPosition = position;
            switch (this.keys[0]) {
                case "<up>":
                    newPosition = yield new MoveUpArrow().execAction(position, vimState);
                    break;
                case "<down>":
                    newPosition = yield new MoveDownArrow().execAction(position, vimState);
                    break;
                case "<left>":
                    newPosition = yield new MoveLeftArrow().execAction(position, vimState);
                    break;
                case "<right>":
                    newPosition = yield new MoveRightArrow().execAction(position, vimState);
                    break;
                default:
                    break;
            }
            vimState.replaceState = new replaceState_1.ReplaceState(newPosition);
            return newPosition;
        });
    }
}
exports.ArrowsInInsertMode = ArrowsInInsertMode;
let UpArrowInInsertMode = class UpArrowInInsertMode extends ArrowsInInsertMode {
    constructor() {
        super(...arguments);
        this.keys = ["<up>"];
    }
};
UpArrowInInsertMode = __decorate([
    RegisterAction
], UpArrowInInsertMode);
let DownArrowInInsertMode = class DownArrowInInsertMode extends ArrowsInInsertMode {
    constructor() {
        super(...arguments);
        this.keys = ["<down>"];
    }
};
DownArrowInInsertMode = __decorate([
    RegisterAction
], DownArrowInInsertMode);
let LeftArrowInInsertMode = class LeftArrowInInsertMode extends ArrowsInInsertMode {
    constructor() {
        super(...arguments);
        this.keys = ["<left>"];
    }
};
LeftArrowInInsertMode = __decorate([
    RegisterAction
], LeftArrowInInsertMode);
let RightArrowInInsertMode = class RightArrowInInsertMode extends ArrowsInInsertMode {
    constructor() {
        super(...arguments);
        this.keys = ["<right>"];
    }
};
RightArrowInInsertMode = __decorate([
    RegisterAction
], RightArrowInInsertMode);
let CommandInsertInSearchMode = class CommandInsertInSearchMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SearchInProgressMode];
        this.keys = [["<character>"],
            ["<up>"],
            ["<down>"]];
    }
    runsOnceForEveryCursor() { return this.keysPressed[0] === '\n'; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.keysPressed[0];
            const searchState = vimState.globalState.searchState;
            const prevSearchList = vimState.globalState.searchStatePrevious;
            // handle special keys first
            if (key === "<BS>" || key === "<shift+BS>") {
                searchState.searchString = searchState.searchString.slice(0, -1);
            }
            else if (key === "\n") {
                vimState.currentMode = mode_1.ModeName.Normal;
                // Repeat the previous search if no new string is entered
                if (searchState.searchString === "") {
                    if (prevSearchList.length > 0) {
                        searchState.searchString = prevSearchList[prevSearchList.length - 1].searchString;
                    }
                }
                // Store this search if different than previous
                if (vimState.globalState.searchStatePrevious.length !== 0) {
                    let previousSearchState = vimState.globalState.searchStatePrevious;
                    if (searchState.searchString !== previousSearchState[previousSearchState.length - 1].searchString) {
                        previousSearchState.push(searchState);
                    }
                }
                else {
                    vimState.globalState.searchStatePrevious.push(searchState);
                }
                // Make sure search history does not exceed configuration option
                if (vimState.globalState.searchStatePrevious.length > configuration_1.Configuration.history) {
                    vimState.globalState.searchStatePrevious.splice(0, 1);
                }
                // Update the index to the end of the search history
                vimState.globalState.searchStateIndex = vimState.globalState.searchStatePrevious.length - 1;
                // Move cursor to next match
                vimState.cursorPosition = searchState.getNextSearchMatchPosition(vimState.cursorPosition).pos;
                return vimState;
            }
            else if (key === "<up>") {
                vimState.globalState.searchStateIndex -= 1;
                // Clamp the history index to stay within bounds of search history length
                vimState.globalState.searchStateIndex = Math.max(vimState.globalState.searchStateIndex, 0);
                if (prevSearchList[vimState.globalState.searchStateIndex] !== undefined) {
                    searchState.searchString = prevSearchList[vimState.globalState.searchStateIndex].searchString;
                }
            }
            else if (key === "<down>") {
                vimState.globalState.searchStateIndex += 1;
                // If past the first history item, allow user to enter their own search string (not using history)
                if (vimState.globalState.searchStateIndex > vimState.globalState.searchStatePrevious.length - 1) {
                    searchState.searchString = "";
                    vimState.globalState.searchStateIndex = vimState.globalState.searchStatePrevious.length;
                    return vimState;
                }
                if (prevSearchList[vimState.globalState.searchStateIndex] !== undefined) {
                    searchState.searchString = prevSearchList[vimState.globalState.searchStateIndex].searchString;
                }
            }
            else {
                searchState.searchString += this.keysPressed[0];
            }
            return vimState;
        });
    }
};
CommandInsertInSearchMode = __decorate([
    RegisterAction
], CommandInsertInSearchMode);
let CommandEscInSearchMode = class CommandEscInSearchMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SearchInProgressMode];
        this.keys = ["<Esc>"];
    }
    runsOnceForEveryCursor() { return this.keysPressed[0] === '\n'; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.globalState.searchState = undefined;
            return vimState;
        });
    }
};
CommandEscInSearchMode = __decorate([
    RegisterAction
], CommandEscInSearchMode);
let CommandCtrlVInSearchMode = class CommandCtrlVInSearchMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SearchInProgressMode];
        this.keys = ["<C-v>"];
    }
    runsOnceForEveryCursor() { return this.keysPressed[0] === '\n'; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchState = vimState.globalState.searchState;
            const textFromClipboard = util.clipboardPaste();
            searchState.searchString += textFromClipboard;
            return vimState;
        });
    }
};
CommandCtrlVInSearchMode = __decorate([
    RegisterAction
], CommandCtrlVInSearchMode);
let CommandCmdVInSearchMode = class CommandCmdVInSearchMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SearchInProgressMode];
        this.keys = ["<D-v>"];
    }
    runsOnceForEveryCursor() { return this.keysPressed[0] === '\n'; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchState = vimState.globalState.searchState;
            const textFromClipboard = util.clipboardPaste();
            searchState.searchString += textFromClipboard;
            return vimState;
        });
    }
};
CommandCmdVInSearchMode = __decorate([
    RegisterAction
], CommandCmdVInSearchMode);
/**
 * Our Vim implementation selects up to but not including the final character
 * of a visual selection, instead opting to render a block cursor on the final
 * character. This works for everything except VSCode's native copy command,
 * which loses the final character because it's not selected. We override that
 * copy command here by default to include the final character.
 */
let CommandOverrideCopy = class CommandOverrideCopy extends BaseCommand {
    /**
     * Our Vim implementation selects up to but not including the final character
     * of a visual selection, instead opting to render a block cursor on the final
     * character. This works for everything except VSCode's native copy command,
     * which loses the final character because it's not selected. We override that
     * copy command here by default to include the final character.
     */
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock, mode_1.ModeName.Insert, mode_1.ModeName.Normal];
        this.keys = ["<copy>"]; // A special key - see ModeHandler
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (vimState.currentMode === mode_1.ModeName.Visual ||
                vimState.currentMode === mode_1.ModeName.Normal ||
                vimState.currentMode === mode_1.ModeName.Insert) {
                text = vimState.allCursors.map(range => {
                    const start = position_1.Position.EarlierOf(range.start, range.stop);
                    const stop = position_1.Position.LaterOf(range.start, range.stop);
                    // Insert selecting from the left to the right is a special case that
                    // selects one more on the right.
                    // The order of the if statements is to check for the case where start=stop
                    if (vimState.currentMode !== mode_1.ModeName.Insert || start.isEqual(range.stop)) {
                        return vimState.editor.document.getText(new vscode.Range(start, stop.getRight()));
                    }
                    else {
                        return vimState.editor.document.getText(new vscode.Range(start, stop));
                    }
                }).join("\n");
            }
            else if (vimState.currentMode === mode_1.ModeName.VisualLine) {
                text = vimState.allCursors.map(range => {
                    return vimState.editor.document.getText(new vscode.Range(position_1.Position.EarlierOf(range.start.getLineBegin(), range.stop.getLineBegin()), position_1.Position.LaterOf(range.start.getLineEnd(), range.stop.getLineEnd())));
                }).join("\n");
            }
            else if (vimState.currentMode === mode_1.ModeName.VisualBlock) {
                for (const { line } of position_1.Position.IterateLine(vimState)) {
                    text += line + '\n';
                }
            }
            util.clipboardCopy(text);
            return vimState;
        });
    }
};
CommandOverrideCopy = __decorate([
    RegisterAction
], CommandOverrideCopy);
let CommandNextSearchMatch = class CommandNextSearchMatch extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["n"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchState = vimState.globalState.searchState;
            if (!searchState || searchState.searchString === "") {
                return position;
            }
            // Turn one of the highlighting flags back on (turned off with :nohl)
            vimState.globalState.hl = true;
            if (vimState.cursorPosition.getRight().isEqual(vimState.cursorPosition.getLineEnd())) {
                return searchState.getNextSearchMatchPosition(vimState.cursorPosition.getRight()).pos;
            }
            // Turn one of the highlighting flags back on (turned off with :nohl)
            return searchState.getNextSearchMatchPosition(vimState.cursorPosition).pos;
        });
    }
};
CommandNextSearchMatch = __decorate([
    RegisterAction
], CommandNextSearchMatch);
let CommandCmdA = class CommandCmdA extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<D-a>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.cursorStartPosition = new position_1.Position(0, vimState.desiredColumn);
            vimState.cursorPosition = new position_1.Position(textEditor_1.TextEditor.getLineCount() - 1, vimState.desiredColumn);
            vimState.currentMode = mode_1.ModeName.VisualLine;
            return vimState;
        });
    }
};
CommandCmdA = __decorate([
    RegisterAction
], CommandCmdA);
function searchCurrentWord(position, vimState, direction, isExact) {
    const currentWord = textEditor_1.TextEditor.getWord(position);
    // If the search is going left then use `getWordLeft()` on position to start
    // at the beginning of the word. This ensures that any matches happen
    // outside of the currently selected word.
    const searchStartCursorPosition = direction === searchState_1.SearchDirection.Backward
        ? vimState.cursorPosition.getWordLeft(true)
        : vimState.cursorPosition;
    return createSearchStateAndMoveToMatch({
        needle: currentWord,
        vimState,
        direction,
        isExact,
        searchStartCursorPosition
    });
}
function searchCurrentSelection(vimState, direction) {
    const selection = textEditor_1.TextEditor.getSelection();
    const end = new position_1.Position(selection.end.line, selection.end.character + 1);
    const currentSelection = textEditor_1.TextEditor.getText(selection.with(selection.start, end));
    // Go back to Normal mode, otherwise the selection grows to the next match.
    vimState.currentMode = mode_1.ModeName.Normal;
    // If the search is going left then use `getLeft()` on the selection start.
    // If going right then use `getRight()` on the selection end. This ensures
    // that any matches happen outside of the currently selected word.
    const searchStartCursorPosition = direction === searchState_1.SearchDirection.Backward
        ? vimState.lastVisualSelectionStart.getLeft()
        : vimState.lastVisualSelectionEnd.getRight();
    return createSearchStateAndMoveToMatch({
        needle: currentSelection,
        vimState,
        direction,
        isExact: false,
        searchStartCursorPosition
    });
}
function createSearchStateAndMoveToMatch(args) {
    const { needle, vimState, isExact } = args;
    if (needle === undefined || needle.length === 0) {
        return vimState;
    }
    const searchString = isExact
        ? `\\b${needle}\\b`
        : needle;
    // Start a search for the given term.
    vimState.globalState.searchState = new searchState_1.SearchState(args.direction, vimState.cursorPosition, searchString, { isRegex: isExact });
    vimState.cursorPosition = vimState.globalState.searchState.getNextSearchMatchPosition(args.searchStartCursorPosition).pos;
    // Turn one of the highlighting flags back on (turned off with :nohl)
    vimState.globalState.hl = true;
    return vimState;
}
let CommandSearchCurrentWordExactForward = class CommandSearchCurrentWordExactForward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["*"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentWord(position, vimState, searchState_1.SearchDirection.Forward, true);
        });
    }
};
CommandSearchCurrentWordExactForward = __decorate([
    RegisterAction
], CommandSearchCurrentWordExactForward);
let CommandSearchCurrentWordForward = class CommandSearchCurrentWordForward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["g", "*"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentWord(position, vimState, searchState_1.SearchDirection.Forward, false);
        });
    }
};
CommandSearchCurrentWordForward = __decorate([
    RegisterAction
], CommandSearchCurrentWordForward);
let CommandSearchVisualForward = class CommandSearchVisualForward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["*"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentSelection(vimState, searchState_1.SearchDirection.Forward);
        });
    }
};
CommandSearchVisualForward = __decorate([
    RegisterAction
], CommandSearchVisualForward);
let CommandSearchCurrentWordExactBackward = class CommandSearchCurrentWordExactBackward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["#"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentWord(position, vimState, searchState_1.SearchDirection.Backward, true);
        });
    }
};
CommandSearchCurrentWordExactBackward = __decorate([
    RegisterAction
], CommandSearchCurrentWordExactBackward);
let CommandSearchCurrentWordBackward = class CommandSearchCurrentWordBackward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["g", "#"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentWord(position, vimState, searchState_1.SearchDirection.Backward, false);
        });
    }
};
CommandSearchCurrentWordBackward = __decorate([
    RegisterAction
], CommandSearchCurrentWordBackward);
let CommandSearchVisualBackward = class CommandSearchVisualBackward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["#"];
        this.isMotion = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return searchCurrentSelection(vimState, searchState_1.SearchDirection.Backward);
        });
    }
};
CommandSearchVisualBackward = __decorate([
    RegisterAction
], CommandSearchVisualBackward);
let CommandPreviousSearchMatch = class CommandPreviousSearchMatch extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["N"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchState = vimState.globalState.searchState;
            if (!searchState || searchState.searchString === "") {
                return position;
            }
            // Turn one of the highlighting flags back on (turned off with :nohl)
            vimState.globalState.hl = true;
            return searchState.getNextSearchMatchPosition(vimState.cursorPosition, -1).pos;
        });
    }
};
CommandPreviousSearchMatch = __decorate([
    RegisterAction
], CommandPreviousSearchMatch);
let CommandCtrlHInInsertMode = class CommandCtrlHInInsertMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-h>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.recordedState.transformations.push({
                type: "deleteText",
                position: position,
            });
            return vimState;
        });
    }
};
CommandCtrlHInInsertMode = __decorate([
    RegisterAction
], CommandCtrlHInInsertMode);
let CommandCtrlUInInsertMode = class CommandCtrlUInInsertMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-u>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = position.getLineBegin();
            const stop = position.getLineEnd();
            yield textEditor_1.TextEditor.delete(new vscode.Range(start, stop));
            vimState.cursorPosition = start;
            vimState.cursorStartPosition = start;
            return vimState;
        });
    }
};
CommandCtrlUInInsertMode = __decorate([
    RegisterAction
], CommandCtrlUInInsertMode);
let CommandCtrlN = class CommandCtrlN extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-n>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("selectNextSuggestion");
            return vimState;
        });
    }
};
CommandCtrlN = __decorate([
    RegisterAction
], CommandCtrlN);
let CommandCtrlP = class CommandCtrlP extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert];
        this.keys = ["<C-p>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("selectPrevSuggestion");
            return vimState;
        });
    }
};
CommandCtrlP = __decorate([
    RegisterAction
], CommandCtrlP);
let CommandSearchForwards = class CommandSearchForwards extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["/"];
        this.isMotion = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.globalState.searchState = new searchState_1.SearchState(searchState_1.SearchDirection.Forward, vimState.cursorPosition, "", { isRegex: true });
            vimState.currentMode = mode_1.ModeName.SearchInProgressMode;
            // Reset search history index
            vimState.globalState.searchStateIndex = vimState.globalState.searchStatePrevious.length;
            vimState.globalState.hl = true;
            return vimState;
        });
    }
};
CommandSearchForwards = __decorate([
    RegisterAction
], CommandSearchForwards);
exports.CommandSearchForwards = CommandSearchForwards;
let CommandSearchBackwards = class CommandSearchBackwards extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["?"];
        this.isMotion = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.globalState.searchState = new searchState_1.SearchState(searchState_1.SearchDirection.Backward, vimState.cursorPosition, "", { isRegex: true });
            vimState.currentMode = mode_1.ModeName.SearchInProgressMode;
            // Reset search history index
            vimState.globalState.searchStateIndex = vimState.globalState.searchStatePrevious.length;
            vimState.globalState.hl = true;
            return vimState;
        });
    }
};
CommandSearchBackwards = __decorate([
    RegisterAction
], CommandSearchBackwards);
exports.CommandSearchBackwards = CommandSearchBackwards;
let DeleteOperator = class DeleteOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["d"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    /**
     * Deletes from the position of start to 1 past the position of end.
     */
    delete(start, end, currentMode, registerMode, vimState, yank = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (registerMode === register_1.RegisterMode.LineWise) {
                start = start.getLineBegin();
                end = end.getLineEnd();
            }
            end = new position_1.Position(end.line, end.character + 1);
            const isOnLastLine = end.line === textEditor_1.TextEditor.getLineCount() - 1;
            // Vim does this weird thing where it allows you to select and delete
            // the newline character, which it places 1 past the last character
            // in the line. Here we interpret a character position 1 past the end
            // as selecting the newline character. Don't allow this in visual block mode
            if (vimState.currentMode !== mode_1.ModeName.VisualBlock) {
                if (end.character === textEditor_1.TextEditor.getLineAt(end).text.length + 1) {
                    end = end.getDown(0);
                }
            }
            let text = vimState.editor.document.getText(new vscode.Range(start, end));
            // If we delete linewise to the final line of the document, we expect the line
            // to be removed. This is actually a special case because the newline
            // character we've selected to delete is the newline on the end of the document,
            // but we actually delete the newline on the second to last line.
            // Just writing about this is making me more confused. -_-
            // rebornix: johnfn's description about this corner case is perfectly correct. The only catch is
            // that we definitely don't want to put the EOL in the register. So here we run the `getText`
            // expression first and then update the start position.
            // Now rebornix is confused as well.
            if (isOnLastLine &&
                start.line !== 0 &&
                registerMode === register_1.RegisterMode.LineWise) {
                start = start.getPreviousLineBegin().getLineEnd();
            }
            if (registerMode === register_1.RegisterMode.LineWise) {
                // slice final newline in linewise mode - linewise put will add it back.
                text = text.endsWith("\r\n") ? text.slice(0, -2) : (text.endsWith('\n') ? text.slice(0, -1) : text);
            }
            if (yank) {
                register_1.Register.put(text, vimState, this.multicursorIndex);
            }
            let diff = new position_1.PositionDiff(0, 0);
            let resultingPosition;
            if (currentMode === mode_1.ModeName.Visual) {
                resultingPosition = position_1.Position.EarlierOf(start, end);
            }
            if (start.character > textEditor_1.TextEditor.getLineAt(start).text.length) {
                resultingPosition = start.getLeft();
                diff = new position_1.PositionDiff(0, -1);
            }
            else {
                resultingPosition = start;
            }
            if (registerMode === register_1.RegisterMode.LineWise) {
                resultingPosition = resultingPosition.getLineBegin();
                diff = position_1.PositionDiff.NewBOLDiff();
            }
            vimState.recordedState.transformations.push({
                type: "deleteRange",
                range: new range_1.Range(start, end),
                diff: diff,
            });
            return resultingPosition;
        });
    }
    run(vimState, start, end, yank = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.delete(start, end, vimState.currentMode, vimState.effectiveRegisterMode(), vimState, yank);
            vimState.currentMode = mode_1.ModeName.Normal;
            /*
              vimState.cursorPosition      = result;
              vimState.cursorStartPosition = result;
            */
            return vimState;
        });
    }
};
DeleteOperator = __decorate([
    RegisterAction
], DeleteOperator);
exports.DeleteOperator = DeleteOperator;
let DeleteOperatorVisual = class DeleteOperatorVisual extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["D"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            // ensures linewise deletion when in visual mode
            // see special case in DeleteOperator.delete()
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return yield new DeleteOperator(this.multicursorIndex).run(vimState, start, end);
        });
    }
};
DeleteOperatorVisual = __decorate([
    RegisterAction
], DeleteOperatorVisual);
exports.DeleteOperatorVisual = DeleteOperatorVisual;
let YankOperator = class YankOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["y"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.canBeRepeatedWithDot = false;
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            // Hack to make Surround with y (which takes a motion) work.
            if (vimState.surround) {
                vimState.surround.range = new range_1.Range(start, end);
                vimState.currentMode = mode_1.ModeName.SurroundInputMode;
                vimState.cursorPosition = start;
                vimState.cursorStartPosition = start;
                return vimState;
            }
            const originalMode = vimState.currentMode;
            if (start.compareTo(end) <= 0) {
                end = new position_1.Position(end.line, end.character + 1);
            }
            else {
                const tmp = start;
                start = end;
                end = tmp;
                end = new position_1.Position(end.line, end.character + 1);
            }
            if (vimState.currentRegisterMode === register_1.RegisterMode.LineWise) {
                start = start.getLineBegin();
                end = end.getLineEnd();
            }
            let text = textEditor_1.TextEditor.getText(new vscode.Range(start, end));
            // If we selected the newline character, add it as well.
            if (vimState.currentMode === mode_1.ModeName.Visual &&
                end.character === textEditor_1.TextEditor.getLineAt(end).text.length + 1) {
                text = text + "\n";
            }
            register_1.Register.put(text, vimState, this.multicursorIndex);
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorStartPosition = start;
            if (originalMode === mode_1.ModeName.Normal) {
                vimState.allCursors = vimState.cursorPositionJustBeforeAnythingHappened.map(x => new range_1.Range(x, x));
            }
            else {
                vimState.cursorPosition = start;
            }
            return vimState;
        });
    }
};
YankOperator = __decorate([
    RegisterAction
], YankOperator);
exports.YankOperator = YankOperator;
let ShiftYankOperatorVisual = class ShiftYankOperatorVisual extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["Y"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return yield new YankOperator().run(vimState, start, end);
        });
    }
};
ShiftYankOperatorVisual = __decorate([
    RegisterAction
], ShiftYankOperatorVisual);
exports.ShiftYankOperatorVisual = ShiftYankOperatorVisual;
let DeleteOperatorXVisual = class DeleteOperatorXVisual extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["x"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new DeleteOperator(this.multicursorIndex).run(vimState, start, end);
        });
    }
};
DeleteOperatorXVisual = __decorate([
    RegisterAction
], DeleteOperatorXVisual);
exports.DeleteOperatorXVisual = DeleteOperatorXVisual;
let ChangeOperatorSVisual = class ChangeOperatorSVisual extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["s"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new ChangeOperator().run(vimState, start, end);
        });
    }
};
ChangeOperatorSVisual = __decorate([
    RegisterAction
], ChangeOperatorSVisual);
exports.ChangeOperatorSVisual = ChangeOperatorSVisual;
let FormatOperator = class FormatOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["="];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.editor.selection = new vscode.Selection(start, end);
            yield vscode.commands.executeCommand("editor.action.formatSelection");
            let line = vimState.cursorStartPosition.line;
            if (vimState.cursorStartPosition.isAfter(vimState.cursorPosition)) {
                line = vimState.cursorPosition.line;
            }
            let newCursorPosition = new position_1.Position(line, 0);
            vimState.cursorPosition = newCursorPosition;
            vimState.cursorStartPosition = newCursorPosition;
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
FormatOperator = __decorate([
    RegisterAction
], FormatOperator);
exports.FormatOperator = FormatOperator;
let UpperCaseOperator = class UpperCaseOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["U"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const range = new vscode.Range(start, new position_1.Position(end.line, end.character + 1));
            let text = vimState.editor.document.getText(range);
            yield textEditor_1.TextEditor.replace(range, text.toUpperCase());
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start;
            return vimState;
        });
    }
};
UpperCaseOperator = __decorate([
    RegisterAction
], UpperCaseOperator);
exports.UpperCaseOperator = UpperCaseOperator;
let UpperCaseWithMotion = class UpperCaseWithMotion extends UpperCaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["g", "U"];
        this.modes = [mode_1.ModeName.Normal];
    }
};
UpperCaseWithMotion = __decorate([
    RegisterAction
], UpperCaseWithMotion);
exports.UpperCaseWithMotion = UpperCaseWithMotion;
let LowerCaseOperator = class LowerCaseOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["u"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const range = new vscode.Range(start, new position_1.Position(end.line, end.character + 1));
            let text = vimState.editor.document.getText(range);
            yield textEditor_1.TextEditor.replace(range, text.toLowerCase());
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start;
            return vimState;
        });
    }
};
LowerCaseOperator = __decorate([
    RegisterAction
], LowerCaseOperator);
exports.LowerCaseOperator = LowerCaseOperator;
let LowerCaseWithMotion = class LowerCaseWithMotion extends LowerCaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["g", "u"];
        this.modes = [mode_1.ModeName.Normal];
    }
};
LowerCaseWithMotion = __decorate([
    RegisterAction
], LowerCaseWithMotion);
exports.LowerCaseWithMotion = LowerCaseWithMotion;
let MarkCommand = class MarkCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["m", "<character>"];
        this.modes = [mode_1.ModeName.Normal];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const markName = this.keysPressed[1];
            vimState.historyTracker.addMark(position, markName);
            return vimState;
        });
    }
};
MarkCommand = __decorate([
    RegisterAction
], MarkCommand);
exports.MarkCommand = MarkCommand;
let MarkMovementBOL = class MarkMovementBOL extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["'", "<character>"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const markName = this.keysPressed[1];
            const mark = vimState.historyTracker.getMark(markName);
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return mark.position.getFirstLineNonBlankChar();
        });
    }
};
MarkMovementBOL = __decorate([
    RegisterAction
], MarkMovementBOL);
exports.MarkMovementBOL = MarkMovementBOL;
let MarkMovement = class MarkMovement extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["`", "<character>"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const markName = this.keysPressed[1];
            const mark = vimState.historyTracker.getMark(markName);
            return mark.position;
        });
    }
};
MarkMovement = __decorate([
    RegisterAction
], MarkMovement);
exports.MarkMovement = MarkMovement;
let ChangeOperator = class ChangeOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["c"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEndOfLine = end.character === end.getLineEnd().character;
            let state = vimState;
            // If we delete to EOL, the block cursor would end on the final character,
            // which means the insert cursor would be one to the left of the end of
            // the line. We do want to run delete if it is a multiline change though ex. c}
            if (position_1.Position.getLineLength(textEditor_1.TextEditor.getLineAt(start).lineNumber) !== 0 || (end.line !== start.line)) {
                if (isEndOfLine) {
                    state = yield new DeleteOperator(this.multicursorIndex).run(vimState, start, end.getLeftThroughLineBreaks());
                }
                else {
                    state = yield new DeleteOperator(this.multicursorIndex).run(vimState, start, end);
                }
            }
            state.currentMode = mode_1.ModeName.Insert;
            if (isEndOfLine) {
                state.cursorPosition = state.cursorPosition.getRight();
            }
            return state;
        });
    }
};
ChangeOperator = __decorate([
    RegisterAction
], ChangeOperator);
exports.ChangeOperator = ChangeOperator;
let PutCommand = PutCommand_1 = class PutCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["p"];
        this.modes = [mode_1.ModeName.Normal];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    static GetText(vimState, multicursorIndex = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const register = yield register_1.Register.get(vimState);
            if (vimState.isMultiCursor) {
                if (multicursorIndex === undefined) {
                    console.log("ERROR: no multi cursor index when calling PutCommand#getText");
                    throw new Error("Bad!");
                }
                if (vimState.isMultiCursor && typeof register.text === "object") {
                    return register.text[multicursorIndex];
                }
            }
            return register.text;
        });
    }
    exec(position, vimState, after = false, adjustIndent = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const register = yield register_1.Register.get(vimState);
            const dest = after ? position : position.getRight();
            if (register.text instanceof modeHandler_1.RecordedState) {
                /**
                 *  Paste content from recordedState. This one is actually complex as Vim has internal key code for key strokes.
                 *  For example, Backspace is stored as `<80>kb`. So if you replay a macro, which is stored in a register as `a1<80>kb2`, you
                 *  shall just get `2` inserted as `a` represents entering Insert Mode, `<80>bk` represents Backspace. However here, we shall
                 *  insert the plain text content of the register, which is `a1<80>kb2`.
                 */
                vimState.recordedState.transformations.push({
                    type: "macro",
                    register: vimState.recordedState.registerName,
                    replay: "keystrokes"
                });
                return vimState;
            }
            else if (typeof register.text === "object" && vimState.currentMode === mode_1.ModeName.VisualBlock) {
                return yield this.execVisualBlockPaste(register.text, position, vimState, after);
            }
            let text = yield PutCommand_1.GetText(vimState, this.multicursorIndex);
            let textToAdd;
            let whereToAddText;
            let diff = new position_1.PositionDiff(0, 0);
            if (register.registerMode === register_1.RegisterMode.CharacterWise) {
                textToAdd = text;
                whereToAddText = dest;
            }
            else {
                if (adjustIndent) {
                    // Adjust indent to current line
                    let indentationWidth = textEditor_1.TextEditor.getIndentationLevel(textEditor_1.TextEditor.getLineAt(position).text);
                    let firstLineIdentationWidth = textEditor_1.TextEditor.getIndentationLevel(text.split('\n')[0]);
                    text = text.split('\n').map(line => {
                        let currentIdentationWidth = textEditor_1.TextEditor.getIndentationLevel(line);
                        let newIndentationWidth = currentIdentationWidth - firstLineIdentationWidth + indentationWidth;
                        return textEditor_1.TextEditor.setIndentationLevel(line, newIndentationWidth);
                    }).join('\n');
                }
                if (after) {
                    // P insert before current line
                    textToAdd = text + "\n";
                    whereToAddText = dest.getLineBegin();
                }
                else {
                    // p paste after current line
                    textToAdd = "\n" + text;
                    whereToAddText = dest.getLineEnd();
                }
            }
            // More vim weirdness: If the thing you're pasting has a newline, the cursor
            // stays in the same place. Otherwise, it moves to the end of what you pasted.
            const numNewlines = text.split("\n").length - 1;
            const currentLineLength = textEditor_1.TextEditor.getLineAt(position).text.length;
            if (register.registerMode === register_1.RegisterMode.LineWise) {
                const check = text.match(/^\s*/);
                let numWhitespace = 0;
                if (check) {
                    numWhitespace = check[0].length;
                }
                if (after) {
                    diff = position_1.PositionDiff.NewBOLDiff(-numNewlines - 1, numWhitespace);
                }
                else {
                    diff = position_1.PositionDiff.NewBOLDiff(currentLineLength > 0 ? 1 : -numNewlines, numWhitespace);
                }
            }
            else {
                if (text.indexOf("\n") === -1) {
                    if (!position.isLineEnd()) {
                        if (after) {
                            diff = new position_1.PositionDiff(0, -1);
                        }
                        else {
                            diff = new position_1.PositionDiff(0, textToAdd.length);
                        }
                    }
                }
                else {
                    if (position.isLineEnd()) {
                        diff = position_1.PositionDiff.NewBOLDiff(-numNewlines, position.character);
                    }
                    else {
                        if (after) {
                            diff = position_1.PositionDiff.NewBOLDiff(-numNewlines, position.character);
                        }
                        else {
                            diff = new position_1.PositionDiff(0, 1);
                        }
                    }
                }
            }
            vimState.recordedState.transformations.push({
                type: "insertText",
                text: textToAdd,
                position: whereToAddText,
                diff: diff,
            });
            vimState.currentRegisterMode = register.registerMode;
            return vimState;
        });
    }
    execVisualBlockPaste(block, position, vimState, after) {
        return __awaiter(this, void 0, void 0, function* () {
            if (after) {
                position = position.getRight();
            }
            // Add empty lines at the end of the document, if necessary.
            let linesToAdd = Math.max(0, block.length - (textEditor_1.TextEditor.getLineCount() - position.line) + 1);
            if (linesToAdd > 0) {
                yield textEditor_1.TextEditor.insertAt(Array(linesToAdd).join("\n"), new position_1.Position(textEditor_1.TextEditor.getLineCount() - 1, textEditor_1.TextEditor.getLineAt(new position_1.Position(textEditor_1.TextEditor.getLineCount() - 1, 0)).text.length));
            }
            // paste the entire block.
            for (let lineIndex = position.line; lineIndex < position.line + block.length; lineIndex++) {
                const line = block[lineIndex - position.line];
                const insertPos = new position_1.Position(lineIndex, Math.min(position.character, textEditor_1.TextEditor.getLineAt(new position_1.Position(lineIndex, 0)).text.length));
                yield textEditor_1.TextEditor.insertAt(line, insertPos);
            }
            vimState.currentRegisterMode = register_1.RegisterMode.FigureItOutFromCurrentMode;
            return vimState;
        });
    }
    execCount(position, vimState) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield _super("execCount").call(this, position, vimState);
            if (vimState.effectiveRegisterMode() === register_1.RegisterMode.LineWise &&
                vimState.recordedState.count > 0) {
                const numNewlines = (yield PutCommand_1.GetText(vimState, this.multicursorIndex)).split("\n").length * vimState.recordedState.count;
                result.recordedState.transformations.push({
                    type: "moveCursor",
                    diff: new position_1.PositionDiff(-numNewlines + 1, 0),
                    cursorIndex: this.multicursorIndex
                });
            }
            return result;
        });
    }
};
PutCommand = PutCommand_1 = __decorate([
    RegisterAction
], PutCommand);
exports.PutCommand = PutCommand;
let GPutCommand = class GPutCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["g", "p"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new PutCommand().exec(position, vimState);
            return result;
        });
    }
    execCount(position, vimState) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const register = yield register_1.Register.get(vimState);
            let addedLinesCount;
            if (register.text instanceof modeHandler_1.RecordedState) {
                vimState.recordedState.transformations.push({
                    type: "macro",
                    register: vimState.recordedState.registerName,
                    replay: "keystrokes"
                });
                return vimState;
            }
            if (typeof register.text === "object") {
                addedLinesCount = register.text.length * vimState.recordedState.count;
            }
            else {
                addedLinesCount = register.text.split('\n').length;
            }
            const result = yield _super("execCount").call(this, position, vimState);
            if (vimState.effectiveRegisterMode() === register_1.RegisterMode.LineWise) {
                const line = textEditor_1.TextEditor.getLineAt(position).text;
                const addAnotherLine = line.length > 0 && addedLinesCount > 1;
                result.recordedState.transformations.push({
                    type: "moveCursor",
                    diff: position_1.PositionDiff.NewBOLDiff(1 + (addAnotherLine ? 1 : 0), 0),
                    cursorIndex: this.multicursorIndex
                });
            }
            return result;
        });
    }
};
GPutCommand = __decorate([
    RegisterAction
], GPutCommand);
exports.GPutCommand = GPutCommand;
let PutWithIndentCommand = class PutWithIndentCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["]", "p"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new PutCommand().exec(position, vimState, false, true);
            return result;
        });
    }
    execCount(position, vimState) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("execCount").call(this, position, vimState);
        });
    }
};
PutWithIndentCommand = __decorate([
    RegisterAction
], PutWithIndentCommand);
exports.PutWithIndentCommand = PutWithIndentCommand;
let PutCommandVisual = class PutCommandVisual extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = [
            ["p"],
            ["P"],
        ];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.runsOnceForEachCountPrefix = true;
        this.canBePrefixedWithDot = true;
        // TODO - execWithCount
    }
    exec(position, vimState, after = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = vimState.cursorStartPosition;
            let end = vimState.cursorPosition;
            if (start.isAfter(end)) {
                [start, end] = [end, start];
            }
            const result = yield new DeleteOperator(this.multicursorIndex).run(vimState, start, end, false);
            return yield new PutCommand().exec(start, result, true);
        });
    }
};
PutCommandVisual = __decorate([
    RegisterAction
], PutCommandVisual);
exports.PutCommandVisual = PutCommandVisual;
let IndentOperator = class IndentOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = [">"];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.editor.selection = new vscode.Selection(start.getLineBegin(), end.getLineEnd());
            yield vscode.commands.executeCommand("editor.action.indentLines");
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
IndentOperator = __decorate([
    RegisterAction
], IndentOperator);
/**
 * `3>` to indent a line 3 times in visual mode is actually a bit of a special case.
 *
 * > is an operator, and generally speaking, you don't run operators multiple times, you run motions multiple times.
 * e.g. `d3w` runs `w` 3 times, then runs d once.
 *
 * Same with literally every other operator motion combination... until `3>`in visual mode
 * walked into my life.
 */
let IndentOperatorInVisualModesIsAWeirdSpecialCase = class IndentOperatorInVisualModesIsAWeirdSpecialCase extends BaseOperator {
    /**
     * `3>` to indent a line 3 times in visual mode is actually a bit of a special case.
     *
     * > is an operator, and generally speaking, you don't run operators multiple times, you run motions multiple times.
     * e.g. `d3w` runs `w` 3 times, then runs d once.
     *
     * Same with literally every other operator motion combination... until `3>`in visual mode
     * walked into my life.
     */
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = [">"];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < (vimState.recordedState.count || 1); i++) {
                yield vscode.commands.executeCommand("editor.action.indentLines");
            }
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
IndentOperatorInVisualModesIsAWeirdSpecialCase = __decorate([
    RegisterAction
], IndentOperatorInVisualModesIsAWeirdSpecialCase);
let OutdentOperator = class OutdentOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<"];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.editor.selection = new vscode.Selection(start, end);
            yield vscode.commands.executeCommand("editor.action.outdentLines");
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
OutdentOperator = __decorate([
    RegisterAction
], OutdentOperator);
/**
 * See comment for IndentOperatorInVisualModesIsAWeirdSpecialCase
 */
let OutdentOperatorInVisualModesIsAWeirdSpecialCase = class OutdentOperatorInVisualModesIsAWeirdSpecialCase extends BaseOperator {
    /**
     * See comment for IndentOperatorInVisualModesIsAWeirdSpecialCase
     */
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["<"];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < (vimState.recordedState.count || 1); i++) {
                yield vscode.commands.executeCommand("editor.action.outdentLines");
            }
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
OutdentOperatorInVisualModesIsAWeirdSpecialCase = __decorate([
    RegisterAction
], OutdentOperatorInVisualModesIsAWeirdSpecialCase);
let PutBeforeCommand = class PutBeforeCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["P"];
        this.modes = [mode_1.ModeName.Normal];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new PutCommand();
            command.multicursorIndex = this.multicursorIndex;
            const result = yield command.exec(position, vimState, true);
            return result;
        });
    }
};
PutBeforeCommand = __decorate([
    RegisterAction
], PutBeforeCommand);
exports.PutBeforeCommand = PutBeforeCommand;
let GPutBeforeCommand = class GPutBeforeCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["g", "P"];
        this.modes = [mode_1.ModeName.Normal];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new PutCommand().exec(position, vimState, true);
            const register = yield register_1.Register.get(vimState);
            let addedLinesCount;
            if (register.text instanceof modeHandler_1.RecordedState) {
                vimState.recordedState.transformations.push({
                    type: "macro",
                    register: vimState.recordedState.registerName,
                    replay: "keystrokes"
                });
                return vimState;
            }
            else if (typeof register.text === "object") {
                addedLinesCount = register.text.length * vimState.recordedState.count;
            }
            else {
                addedLinesCount = register.text.split('\n').length;
            }
            if (vimState.effectiveRegisterMode() === register_1.RegisterMode.LineWise) {
                const line = textEditor_1.TextEditor.getLineAt(position).text;
                const addAnotherLine = line.length > 0 && addedLinesCount > 1;
                result.recordedState.transformations.push({
                    type: "moveCursor",
                    diff: position_1.PositionDiff.NewBOLDiff(1 + (addAnotherLine ? 1 : 0), 0),
                    cursorIndex: this.multicursorIndex
                });
            }
            return result;
        });
    }
};
GPutBeforeCommand = __decorate([
    RegisterAction
], GPutBeforeCommand);
exports.GPutBeforeCommand = GPutBeforeCommand;
let PutBeforeWithIndentCommand = class PutBeforeWithIndentCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.keys = ["[", "p"];
        this.modes = [mode_1.ModeName.Normal];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new PutCommand().exec(position, vimState, true, true);
            if (vimState.effectiveRegisterMode() === register_1.RegisterMode.LineWise) {
                result.cursorPosition = result.cursorPosition.getPreviousLineBegin().getFirstLineNonBlankChar();
            }
            return result;
        });
    }
};
PutBeforeWithIndentCommand = __decorate([
    RegisterAction
], PutBeforeWithIndentCommand);
exports.PutBeforeWithIndentCommand = PutBeforeWithIndentCommand;
let CommandShowCommandLine = class CommandShowCommandLine extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = [":"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.recordedState.transformations.push({
                type: "showCommandLine"
            });
            if (vimState.currentMode === mode_1.ModeName.Normal) {
                vimState.commandInitialText = "";
            }
            else {
                vimState.commandInitialText = "'<,'>";
            }
            return vimState;
        });
    }
};
CommandShowCommandLine = __decorate([
    RegisterAction
], CommandShowCommandLine);
let CommandDot = class CommandDot extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["."];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.recordedState.transformations.push({
                type: "dot"
            });
            return vimState;
        });
    }
};
CommandDot = __decorate([
    RegisterAction
], CommandDot);
class CommandFold extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand(this.commandName);
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
}
let CommandCloseFold = class CommandCloseFold extends CommandFold {
    constructor() {
        super(...arguments);
        this.keys = ["z", "c"];
        this.commandName = "editor.fold";
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            yield vscode.commands.executeCommand("editor.fold", { levels: timesToRepeat, direction: "up" });
            return vimState;
        });
    }
};
CommandCloseFold = __decorate([
    RegisterAction
], CommandCloseFold);
let CommandCloseAllFolds = class CommandCloseAllFolds extends CommandFold {
    constructor() {
        super(...arguments);
        this.keys = ["z", "M"];
        this.commandName = "editor.foldAll";
    }
};
CommandCloseAllFolds = __decorate([
    RegisterAction
], CommandCloseAllFolds);
let CommandOpenFold = class CommandOpenFold extends CommandFold {
    constructor() {
        super(...arguments);
        this.keys = ["z", "o"];
        this.commandName = "editor.unfold";
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            yield vscode.commands.executeCommand("editor.unfold", { levels: timesToRepeat, direction: "up" });
            return vimState;
        });
    }
};
CommandOpenFold = __decorate([
    RegisterAction
], CommandOpenFold);
let CommandOpenAllFolds = class CommandOpenAllFolds extends CommandFold {
    constructor() {
        super(...arguments);
        this.keys = ["z", "R"];
        this.commandName = "editor.unfoldAll";
    }
};
CommandOpenAllFolds = __decorate([
    RegisterAction
], CommandOpenAllFolds);
let CommandCloseAllFoldsRecursively = class CommandCloseAllFoldsRecursively extends CommandFold {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["z", "C"];
        this.commandName = "editor.foldRecursively";
    }
};
CommandCloseAllFoldsRecursively = __decorate([
    RegisterAction
], CommandCloseAllFoldsRecursively);
let CommandOpenAllFoldsRecursively = class CommandOpenAllFoldsRecursively extends CommandFold {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["z", "O"];
        this.commandName = "editor.unFoldRecursively";
    }
};
CommandOpenAllFoldsRecursively = __decorate([
    RegisterAction
], CommandOpenAllFoldsRecursively);
let CommandCenterScroll = class CommandCenterScroll extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["z", "z"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // In these modes you want to center on the cursor position
            vimState.editor.revealRange(new vscode.Range(vimState.cursorPosition, vimState.cursorPosition), vscode.TextEditorRevealType.InCenter);
            return vimState;
        });
    }
};
CommandCenterScroll = __decorate([
    RegisterAction
], CommandCenterScroll);
let CommandCenterScrollFirstChar = class CommandCenterScrollFirstChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["z", "."];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // In these modes you want to center on the cursor position
            // This particular one moves cursor to first non blank char though
            vimState.editor.revealRange(new vscode.Range(vimState.cursorPosition, vimState.cursorPosition), vscode.TextEditorRevealType.InCenter);
            // Move cursor to first char of line
            vimState.cursorPosition = vimState.cursorPosition.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
CommandCenterScrollFirstChar = __decorate([
    RegisterAction
], CommandCenterScrollFirstChar);
let CommandTopScroll = class CommandTopScroll extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["z", "t"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.postponedCodeViewChanges.push({
                command: "revealLine",
                args: {
                    lineNumber: position.line,
                    at: "top"
                }
            });
            return vimState;
        });
    }
};
CommandTopScroll = __decorate([
    RegisterAction
], CommandTopScroll);
let CommandTopScrollFirstChar = class CommandTopScrollFirstChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["z", "\n"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // In these modes you want to center on the cursor position
            // This particular one moves cursor to first non blank char though
            vimState.postponedCodeViewChanges.push({
                command: "revealLine",
                args: {
                    lineNumber: position.line,
                    at: "top"
                }
            });
            // Move cursor to first char of line
            vimState.cursorPosition = vimState.cursorPosition.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
CommandTopScrollFirstChar = __decorate([
    RegisterAction
], CommandTopScrollFirstChar);
let CommandBottomScroll = class CommandBottomScroll extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["z", "b"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.postponedCodeViewChanges.push({
                command: "revealLine",
                args: {
                    lineNumber: position.line,
                    at: "bottom"
                }
            });
            return vimState;
        });
    }
};
CommandBottomScroll = __decorate([
    RegisterAction
], CommandBottomScroll);
let CommandBottomScrollFirstChar = class CommandBottomScrollFirstChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["z", "-"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // In these modes you want to center on the cursor position
            // This particular one moves cursor to first non blank char though
            vimState.postponedCodeViewChanges.push({
                command: "revealLine",
                args: {
                    lineNumber: position.line,
                    at: "bottom"
                }
            });
            // Move cursor to first char of line
            vimState.cursorPosition = vimState.cursorPosition.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
CommandBottomScrollFirstChar = __decorate([
    RegisterAction
], CommandBottomScrollFirstChar);
let CommandGoToOtherEndOfHighlightedText = class CommandGoToOtherEndOfHighlightedText extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["o"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            [vimState.cursorStartPosition, vimState.cursorPosition] =
                [vimState.cursorPosition, vimState.cursorStartPosition];
            return vimState;
        });
    }
};
CommandGoToOtherEndOfHighlightedText = __decorate([
    RegisterAction
], CommandGoToOtherEndOfHighlightedText);
let CommandUndo = class CommandUndo extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["u"];
        this.mustBeFirstKey = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPositions = yield vimState.historyTracker.goBackHistoryStep();
            if (newPositions !== undefined) {
                vimState.allCursors = newPositions.map(x => new range_1.Range(x, x));
            }
            vimState.alteredHistory = true;
            return vimState;
        });
    }
};
CommandUndo = __decorate([
    RegisterAction
], CommandUndo);
let CommandRedo = class CommandRedo extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<C-r>"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPositions = yield vimState.historyTracker.goForwardHistoryStep();
            if (newPositions !== undefined) {
                vimState.allCursors = newPositions.map(x => new range_1.Range(x, x));
            }
            vimState.alteredHistory = true;
            return vimState;
        });
    }
};
CommandRedo = __decorate([
    RegisterAction
], CommandRedo);
let CommandDeleteToLineEnd = class CommandDeleteToLineEnd extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["D"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return true; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (position.isLineEnd()) {
                return vimState;
            }
            return yield new DeleteOperator(this.multicursorIndex).run(vimState, position, position.getLineEnd().getLeft());
        });
    }
};
CommandDeleteToLineEnd = __decorate([
    RegisterAction
], CommandDeleteToLineEnd);
let CommandYankFullLine = class CommandYankFullLine extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["Y"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const linesDown = (vimState.recordedState.count || 1) - 1;
            const start = position.getLineBegin();
            const end = new position_1.Position(position.line + linesDown, 0).getLineEnd().getLeft();
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return yield new YankOperator().run(vimState, start, end);
        });
    }
};
CommandYankFullLine = __decorate([
    RegisterAction
], CommandYankFullLine);
exports.CommandYankFullLine = CommandYankFullLine;
let CommandChangeToLineEnd = class CommandChangeToLineEnd extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["C"];
        this.runsOnceForEachCountPrefix = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = vimState.recordedState.count || 1;
            return new ChangeOperator().run(vimState, position, position.getDownByCount(Math.max(0, count - 1)).getLineEnd().getLeft());
        });
    }
};
CommandChangeToLineEnd = __decorate([
    RegisterAction
], CommandChangeToLineEnd);
let CommandClearLine = class CommandClearLine extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["S"];
        this.runsOnceForEachCountPrefix = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = vimState.recordedState.count || 1;
            let end = position.getDownByCount(Math.max(0, count - 1)).getLineEnd().getLeft();
            return new ChangeOperator().run(vimState, position.getLineBeginRespectingIndent(), end);
        });
    }
};
CommandClearLine = __decorate([
    RegisterAction
], CommandClearLine);
let CommandExitVisualMode = class CommandExitVisualMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["v"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommandExitVisualMode = __decorate([
    RegisterAction
], CommandExitVisualMode);
let CommandVisualMode = class CommandVisualMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["v"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Visual;
            return vimState;
        });
    }
};
CommandVisualMode = __decorate([
    RegisterAction
], CommandVisualMode);
let CommandReselectVisual = class CommandReselectVisual extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", "v"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to restore selection only if valid
            if (vimState.lastVisualSelectionEnd !== undefined &&
                vimState.lastVisualSelectionStart !== undefined &&
                vimState.lastVisualMode !== undefined) {
                if (vimState.lastVisualSelectionEnd.line <= (textEditor_1.TextEditor.getLineCount() - 1)) {
                    vimState.currentMode = vimState.lastVisualMode;
                    vimState.cursorStartPosition = vimState.lastVisualSelectionStart;
                    vimState.cursorPosition = vimState.lastVisualSelectionEnd;
                }
            }
            return vimState;
        });
    }
};
CommandReselectVisual = __decorate([
    RegisterAction
], CommandReselectVisual);
let CommandVisualBlockMode = class CommandVisualBlockMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualBlock];
        this.keys = ["<C-v>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vimState.currentMode === mode_1.ModeName.VisualBlock) {
                vimState.currentMode = mode_1.ModeName.Normal;
            }
            else {
                vimState.currentMode = mode_1.ModeName.VisualBlock;
            }
            return vimState;
        });
    }
};
CommandVisualBlockMode = __decorate([
    RegisterAction
], CommandVisualBlockMode);
let CommandVisualLineMode = class CommandVisualLineMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = ["V"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.VisualLine;
            return vimState;
        });
    }
};
CommandVisualLineMode = __decorate([
    RegisterAction
], CommandVisualLineMode);
let CommandExitVisualLineMode = class CommandExitVisualLineMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualLine];
        this.keys = ["V"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommandExitVisualLineMode = __decorate([
    RegisterAction
], CommandExitVisualLineMode);
let CommandOpenFile = class CommandOpenFile extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = ["g", "f"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = "";
            if (vimState.currentMode === mode_1.ModeName.Visual) {
                const selection = textEditor_1.TextEditor.getSelection();
                const end = new position_1.Position(selection.end.line, selection.end.character + 1);
                filePath = textEditor_1.TextEditor.getText(selection.with(selection.start, end));
            }
            else {
                const start = position.getFilePathLeft(true);
                const end = position.getFilePathRight();
                const range = new vscode.Range(start, end);
                filePath = textEditor_1.TextEditor.getText(range).trim();
            }
            const fileCommand = new file_1.FileCommand({ name: filePath });
            fileCommand.execute();
            return vimState;
        });
    }
};
CommandOpenFile = __decorate([
    RegisterAction
], CommandOpenFile);
let CommandGoToDefinition = class CommandGoToDefinition extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", "d"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldActiveEditor = vimState.editor;
            yield vscode.commands.executeCommand("editor.action.goToDeclaration");
            if (oldActiveEditor === vimState.editor) {
                vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            }
            return vimState;
        });
    }
};
CommandGoToDefinition = __decorate([
    RegisterAction
], CommandGoToDefinition);
let CommandGoBackInChangelist = class CommandGoBackInChangelist extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", ";"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalIndex = vimState.historyTracker.changelistIndex;
            const prevPos = vimState.historyTracker.getChangePositionAtindex(originalIndex);
            if (prevPos !== undefined) {
                vimState.cursorPosition = prevPos[0];
                if (vimState.historyTracker.getChangePositionAtindex(originalIndex - 1) !== undefined) {
                    vimState.historyTracker.changelistIndex = originalIndex - 1;
                }
            }
            return vimState;
        });
    }
};
CommandGoBackInChangelist = __decorate([
    RegisterAction
], CommandGoBackInChangelist);
let CommandGoForwardInChangelist = class CommandGoForwardInChangelist extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", ","];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let originalIndex = vimState.historyTracker.changelistIndex;
            // Preincrement if on boundary to prevent seeing the same index twice
            if (originalIndex === 1) {
                originalIndex += 1;
            }
            const nextPos = vimState.historyTracker.getChangePositionAtindex(originalIndex);
            if (nextPos !== undefined) {
                vimState.cursorPosition = nextPos[0];
                if (vimState.historyTracker.getChangePositionAtindex(originalIndex + 1) !== undefined) {
                    vimState.historyTracker.changelistIndex = originalIndex + 1;
                }
            }
            return vimState;
        });
    }
};
CommandGoForwardInChangelist = __decorate([
    RegisterAction
], CommandGoForwardInChangelist);
// begin insert commands
let CommandInsertAtFirstCharacter = class CommandInsertAtFirstCharacter extends BaseCommand {
    // begin insert commands
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = ["I"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.cursorPosition = position.getFirstLineNonBlankChar();
            return vimState;
        });
    }
};
CommandInsertAtFirstCharacter = __decorate([
    RegisterAction
], CommandInsertAtFirstCharacter);
let CommandInsertAtLineBegin = class CommandInsertAtLineBegin extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.mustBeFirstKey = true;
        this.keys = ["g", "I"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.cursorPosition = position.getLineBegin();
            return vimState;
        });
    }
};
CommandInsertAtLineBegin = __decorate([
    RegisterAction
], CommandInsertAtLineBegin);
let CommandInsertAfterCursor = class CommandInsertAfterCursor extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["a"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.cursorPosition = position.getRight();
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        // Only allow this command to be prefixed with a count or nothing, no other
        // actions or operators before
        let previousActionsNumbers = true;
        for (const prevAction of vimState.recordedState.actionsRun) {
            if (!(prevAction instanceof CommandNumber)) {
                previousActionsNumbers = false;
                break;
            }
        }
        if (vimState.recordedState.actionsRun.length === 0 || previousActionsNumbers) {
            return super.couldActionApply(vimState, keysPressed);
        }
        return false;
    }
};
CommandInsertAfterCursor = __decorate([
    RegisterAction
], CommandInsertAfterCursor);
let CommandInsertAtLineEnd = class CommandInsertAtLineEnd extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = ["A"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.cursorPosition = position.getLineEnd();
            return vimState;
        });
    }
};
CommandInsertAtLineEnd = __decorate([
    RegisterAction
], CommandInsertAtLineEnd);
let CommandInsertNewLineAbove = class CommandInsertNewLineAbove extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["O"];
    }
    runsOnceForEveryCursor() { return true; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let indentationWidth = textEditor_1.TextEditor.getIndentationLevel(textEditor_1.TextEditor.getLineAt(position).text);
            vimState.currentMode = mode_1.ModeName.Insert;
            vimState.recordedState.transformations.push({
                type: "insertText",
                text: textEditor_1.TextEditor.setIndentationLevel("V", indentationWidth).replace("V", "\n"),
                position: new position_1.Position(vimState.cursorPosition.line, 0),
                diff: new position_1.PositionDiff(-1, indentationWidth),
            });
            return vimState;
        });
    }
};
CommandInsertNewLineAbove = __decorate([
    RegisterAction
], CommandInsertNewLineAbove);
let CommandInsertNewLineBefore = class CommandInsertNewLineBefore extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["o"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.Insert;
            yield vscode.commands.executeCommand('editor.action.insertLineAfter');
            vimState.allCursors = yield util_1.allowVSCodeToPropagateCursorUpdatesAndReturnThem();
            return vimState;
        });
    }
};
CommandInsertNewLineBefore = __decorate([
    RegisterAction
], CommandInsertNewLineBefore);
let CommandNavigateBack = class CommandNavigateBack extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<C-o>"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldActiveEditor = vimState.editor;
            yield vscode.commands.executeCommand('workbench.action.navigateBack');
            if (oldActiveEditor === vimState.editor) {
                vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            }
            return vimState;
        });
    }
};
CommandNavigateBack = __decorate([
    RegisterAction
], CommandNavigateBack);
let CommandNavigateForward = class CommandNavigateForward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<C-i>"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldActiveEditor = vimState.editor;
            yield vscode.commands.executeCommand('workbench.action.navigateForward');
            if (oldActiveEditor === vimState.editor) {
                vimState.cursorPosition = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            }
            return vimState;
        });
    }
};
CommandNavigateForward = __decorate([
    RegisterAction
], CommandNavigateForward);
let MoveLeft = class MoveLeft extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["h"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLeft();
        });
    }
};
MoveLeft = __decorate([
    RegisterAction
], MoveLeft);
let MoveLeftArrow = class MoveLeftArrow extends MoveLeft {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<left>"];
    }
};
MoveLeftArrow = __decorate([
    RegisterAction
], MoveLeftArrow);
let BackSpaceInNormalMode = class BackSpaceInNormalMode extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<BS>"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLeftThroughLineBreaks();
        });
    }
};
BackSpaceInNormalMode = __decorate([
    RegisterAction
], BackSpaceInNormalMode);
let MoveUp = class MoveUp extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["k"];
        this.doesntChangeDesiredColumn = true;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getUp(vimState.desiredColumn);
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return position.getUp(position.getLineEnd().character);
        });
    }
};
MoveUp = __decorate([
    RegisterAction
], MoveUp);
let MoveUpArrow = class MoveUpArrow extends MoveUp {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<up>"];
    }
};
MoveUpArrow = __decorate([
    RegisterAction
], MoveUpArrow);
let MoveDown = class MoveDown extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["j"];
        this.doesntChangeDesiredColumn = true;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getDown(vimState.desiredColumn);
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            return position.getDown(position.getLineEnd().character);
        });
    }
};
MoveDown = __decorate([
    RegisterAction
], MoveDown);
let MoveDownArrow = class MoveDownArrow extends MoveDown {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<down>"];
    }
};
MoveDownArrow = __decorate([
    RegisterAction
], MoveDownArrow);
let MoveRight = class MoveRight extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["l"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return new position_1.Position(position.line, position.character + 1);
        });
    }
};
MoveRight = __decorate([
    RegisterAction
], MoveRight);
let MoveRightArrow = class MoveRightArrow extends MoveRight {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<right>"];
    }
};
MoveRightArrow = __decorate([
    RegisterAction
], MoveRightArrow);
let MoveRightWithSpace = class MoveRightWithSpace extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [" "];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getRightThroughLineBreaks();
        });
    }
};
MoveRightWithSpace = __decorate([
    RegisterAction
], MoveRightWithSpace);
let CommandQuit = class CommandQuit extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<C-w>", "q"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            new quit_1.QuitCommand({}).execute();
            return vimState;
        });
    }
};
CommandQuit = __decorate([
    RegisterAction
], CommandQuit);
let MoveToRightPane = class MoveToRightPane extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = [["<C-w>", "l"], ["<C-w>", "<right>"], ["<C-w l>"]];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.postponedCodeViewChanges.push({
                command: "workbench.action.navigateRight",
                args: {}
            });
            return vimState;
        });
    }
};
MoveToRightPane = __decorate([
    RegisterAction
], MoveToRightPane);
let MoveToLeftPane = class MoveToLeftPane extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = [["<C-w>", "h"], ["<C-w>", "<left>"], ["<C-w h>"]];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.postponedCodeViewChanges.push({
                command: "workbench.action.navigateLeft",
                args: {}
            });
            return vimState;
        });
    }
};
MoveToLeftPane = __decorate([
    RegisterAction
], MoveToLeftPane);
let CycleThroughPanes = class CycleThroughPanes extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["<C-w>", "<C-w>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.postponedCodeViewChanges.push({
                command: "workbench.action.navigateRight",
                args: {}
            });
            return vimState;
        });
    }
};
CycleThroughPanes = __decorate([
    RegisterAction
], CycleThroughPanes);
class BaseTabCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.runsOnceForEachCountPrefix = true;
    }
}
let CommandTabNext = class CommandTabNext extends BaseTabCommand {
    constructor() {
        super(...arguments);
        this.keys = [
            ["g", "t"],
            ["<C-pagedown>"],
        ];
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            (new tab_1.TabCommand({
                tab: tab_1.Tab.Next,
                count: vimState.recordedState.count
            })).execute();
            return vimState;
        });
    }
};
CommandTabNext = __decorate([
    RegisterAction
], CommandTabNext);
let CommandTabPrevious = class CommandTabPrevious extends BaseTabCommand {
    constructor() {
        super(...arguments);
        this.keys = [
            ["g", "T"],
            ["<C-pageup>"],
        ];
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            (new tab_1.TabCommand({
                tab: tab_1.Tab.Previous,
                count: 1
            })).execute();
            return vimState;
        });
    }
};
CommandTabPrevious = __decorate([
    RegisterAction
], CommandTabPrevious);
let MoveDownNonBlank = class MoveDownNonBlank extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["+"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getDownByCount(Math.max(count, 1))
                .getFirstLineNonBlankChar();
        });
    }
};
MoveDownNonBlank = __decorate([
    RegisterAction
], MoveDownNonBlank);
let MoveUpNonBlank = class MoveUpNonBlank extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["-"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getUpByCount(Math.max(count, 1))
                .getFirstLineNonBlankChar();
        });
    }
};
MoveUpNonBlank = __decorate([
    RegisterAction
], MoveUpNonBlank);
let MoveDownUnderscore = class MoveDownUnderscore extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["_"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getDownByCount(Math.max(count - 1, 0))
                .getFirstLineNonBlankChar();
        });
    }
};
MoveDownUnderscore = __decorate([
    RegisterAction
], MoveDownUnderscore);
let MoveToColumn = class MoveToColumn extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["|"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return new position_1.Position(position.line, Math.max(0, count - 1));
        });
    }
};
MoveToColumn = __decorate([
    RegisterAction
], MoveToColumn);
let MoveFindForward = class MoveFindForward extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["f", "<character>"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count || 1;
            const toFind = this.keysPressed[1];
            let result = position.findForwards(toFind, count);
            if (!result) {
                return { start: position, stop: position, failed: true };
            }
            if (vimState.recordedState.operator) {
                result = result.getRight();
            }
            return result;
        });
    }
    canBeRepeatedWithSemicolon(vimState, result) {
        return !vimState.recordedState.operator || !(isIMovement(result) && result.failed);
    }
};
MoveFindForward = __decorate([
    RegisterAction
], MoveFindForward);
let MoveFindBackward = class MoveFindBackward extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["F", "<character>"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count || 1;
            const toFind = this.keysPressed[1];
            let result = position.findBackwards(toFind, count);
            if (!result) {
                return { start: position, stop: position, failed: true };
            }
            return result;
        });
    }
    canBeRepeatedWithSemicolon(vimState, result) {
        return !vimState.recordedState.operator || !(isIMovement(result) && result.failed);
    }
};
MoveFindBackward = __decorate([
    RegisterAction
], MoveFindBackward);
let MoveTilForward = class MoveTilForward extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["t", "<character>"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count || 1;
            const toFind = this.keysPressed[1];
            let result = position.tilForwards(toFind, count);
            if (!result) {
                return { start: position, stop: position, failed: true };
            }
            if (vimState.recordedState.operator) {
                result = result.getRight();
            }
            return result;
        });
    }
    canBeRepeatedWithSemicolon(vimState, result) {
        return !vimState.recordedState.operator || !(isIMovement(result) && result.failed);
    }
};
MoveTilForward = __decorate([
    RegisterAction
], MoveTilForward);
let MoveTilBackward = class MoveTilBackward extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["T", "<character>"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count || 1;
            const toFind = this.keysPressed[1];
            let result = position.tilBackwards(toFind, count);
            if (!result) {
                return { start: position, stop: position, failed: true };
            }
            return result;
        });
    }
    canBeRepeatedWithSemicolon(vimState, result) {
        return !vimState.recordedState.operator || !(isIMovement(result) && result.failed);
    }
};
MoveTilBackward = __decorate([
    RegisterAction
], MoveTilBackward);
let MoveRepeat = class MoveRepeat extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [";"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const movement = modeHandler_1.VimState.lastRepeatableMovement;
            if (movement) {
                const result = yield movement.execActionWithCount(position, vimState, count);
                /**
                 * For t<character> and T<character> commands vim executes ; as 2;
                 * This way the cursor will get to the next instance of <character>
                 */
                if (result instanceof position_1.Position && position.isEqual(result) && count <= 1) {
                    return yield movement.execActionWithCount(position, vimState, 2);
                }
                return result;
            }
            return position;
        });
    }
};
MoveRepeat = __decorate([
    RegisterAction
], MoveRepeat);
let MoveRepeatReversed = MoveRepeatReversed_1 = class MoveRepeatReversed extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [","];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const movement = modeHandler_1.VimState.lastRepeatableMovement;
            if (movement) {
                const reverse = MoveRepeatReversed_1.reverseMotionMapping.get(movement.constructor)();
                reverse.keysPressed = [reverse.keys[0], movement.keysPressed[1]];
                let result = yield reverse.execActionWithCount(position, vimState, count);
                // For t<character> and T<character> commands vim executes ; as 2;
                if (result instanceof position_1.Position && position.isEqual(result) && count <= 1) {
                    result = yield reverse.execActionWithCount(position, vimState, 2);
                }
                return result;
            }
            return position;
        });
    }
};
MoveRepeatReversed.reverseMotionMapping = new Map([
    [MoveFindForward, () => new MoveFindBackward()],
    [MoveFindBackward, () => new MoveFindForward()],
    [MoveTilForward, () => new MoveTilBackward()],
    [MoveTilBackward, () => new MoveTilForward()]
]);
MoveRepeatReversed = MoveRepeatReversed_1 = __decorate([
    RegisterAction
], MoveRepeatReversed);
let MoveLineEnd = class MoveLineEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [
            ["$"],
            ["<end>"],
            ["<D-right>"]
        ];
        this.setsDesiredColumnToEOL = true;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLineEnd();
        });
    }
};
MoveLineEnd = __decorate([
    RegisterAction
], MoveLineEnd);
let MoveLineBegin = class MoveLineBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [["0"],
            ["<home>"],
            ["<D-left>"]];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLineBegin();
        });
    }
    doesActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) &&
            vimState.recordedState.count === 0;
    }
    couldActionApply(vimState, keysPressed) {
        return super.couldActionApply(vimState, keysPressed) &&
            vimState.recordedState.count === 0;
    }
};
MoveLineBegin = __decorate([
    RegisterAction
], MoveLineBegin);
class MoveByScreenLine extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.value = 1;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: this.movementType,
                select: vimState.currentMode !== mode_1.ModeName.Normal,
                by: this.by,
                value: this.value
            });
            if (vimState.currentMode === mode_1.ModeName.Normal) {
                return position_1.Position.FromVSCodePosition(vimState.editor.selection.active);
            }
            else {
                /**
                 * cursorMove command is handling the selection for us.
                 * So we are not following our design principal (do no real movement inside an action) here.
                 */
                let start = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
                let stop = position_1.Position.FromVSCodePosition(vimState.editor.selection.end);
                let curPos = position_1.Position.FromVSCodePosition(vimState.editor.selection.active);
                // We want to swap the cursor start stop positions based on which direction we are moving, up or down
                if (start.isEqual(curPos)) {
                    position = start;
                    [start, stop] = [stop, start];
                    start = start.getLeft();
                }
                return { start, stop };
            }
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: this.movementType,
                select: true,
                by: this.by,
                value: this.value
            });
            return {
                start: position_1.Position.FromVSCodePosition(vimState.editor.selection.start),
                stop: position_1.Position.FromVSCodePosition(vimState.editor.selection.end)
            };
        });
    }
}
let MoveScreenLineBegin = class MoveScreenLineBegin extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["g", "0"];
        this.movementType = "wrappedLineStart";
    }
};
MoveScreenLineBegin = __decorate([
    RegisterAction
], MoveScreenLineBegin);
let MoveScreenNonBlank = class MoveScreenNonBlank extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["g", "^"];
        this.movementType = "wrappedLineFirstNonWhitespaceCharacter";
    }
};
MoveScreenNonBlank = __decorate([
    RegisterAction
], MoveScreenNonBlank);
let MoveScreenLineEnd = class MoveScreenLineEnd extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["g", "$"];
        this.movementType = "wrappedLineEnd";
    }
};
MoveScreenLineEnd = __decorate([
    RegisterAction
], MoveScreenLineEnd);
let MoveScreenLineEndNonBlank = class MoveScreenLineEndNonBlank extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["g", "_"];
        this.movementType = "wrappedLineLastNonWhitespaceCharacter";
        this.canBePrefixedWithCount = true;
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count || 1;
            const pos = yield this.execAction(position, vimState);
            const newPos = pos;
            // If in visual, return a selection
            if (pos instanceof position_1.Position) {
                return pos.getDownByCount(count - 1);
            }
            else if (isIMovement(pos)) {
                return { start: pos.start, stop: pos.stop.getDownByCount(count - 1).getLeft() };
            }
            return newPos.getDownByCount(count - 1);
        });
    }
};
MoveScreenLineEndNonBlank = __decorate([
    RegisterAction
], MoveScreenLineEndNonBlank);
let MoveScreenLineCenter = class MoveScreenLineCenter extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["g", "m"];
        this.movementType = "wrappedLineColumnCenter";
    }
};
MoveScreenLineCenter = __decorate([
    RegisterAction
], MoveScreenLineCenter);
let MoveUpByScreenLine = class MoveUpByScreenLine extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = [["g", "k"],
            ["g", "<up>"]];
        this.movementType = "up";
        this.by = "wrappedLine";
        this.value = 1;
    }
};
MoveUpByScreenLine = __decorate([
    RegisterAction
], MoveUpByScreenLine);
let MoveDownByScreenLine = class MoveDownByScreenLine extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = [["g", "j"],
            ["g", "<down>"]];
        this.movementType = "down";
        this.by = "wrappedLine";
        this.value = 1;
    }
};
MoveDownByScreenLine = __decorate([
    RegisterAction
], MoveDownByScreenLine);
// Because we can't support moving by screen line when in visualLine mode,
// we change to moving by regular line in visualLine mode. We can't move by
// screen line is that our ranges only support a start and stop attribute,
// and moving by screen line just snaps us back to the original position.
// Check PR #1600 for discussion.
let MoveUpByScreenLineVisualLine = class MoveUpByScreenLineVisualLine extends MoveByScreenLine {
    // Because we can't support moving by screen line when in visualLine mode,
    // we change to moving by regular line in visualLine mode. We can't move by
    // screen line is that our ranges only support a start and stop attribute,
    // and moving by screen line just snaps us back to the original position.
    // Check PR #1600 for discussion.
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualLine];
        this.keys = [["g", "k"],
            ["g", "<up>"]];
        this.movementType = "up";
        this.by = "line";
        this.value = 1;
    }
};
MoveUpByScreenLineVisualLine = __decorate([
    RegisterAction
], MoveUpByScreenLineVisualLine);
let MoveDownByScreenLineVisualLine = class MoveDownByScreenLineVisualLine extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualLine];
        this.keys = [["g", "j"],
            ["g", "<down>"]];
        this.movementType = "down";
        this.by = "line";
        this.value = 1;
    }
};
MoveDownByScreenLineVisualLine = __decorate([
    RegisterAction
], MoveDownByScreenLineVisualLine);
let MoveScreenToRight = class MoveScreenToRight extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["z", "h"];
        this.movementType = "right";
        this.by = "character";
        this.value = 1;
    }
};
MoveScreenToRight = __decorate([
    RegisterAction
], MoveScreenToRight);
let MoveScreenToLeft = class MoveScreenToLeft extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["z", "l"];
        this.movementType = "left";
        this.by = "character";
        this.value = 1;
    }
};
MoveScreenToLeft = __decorate([
    RegisterAction
], MoveScreenToLeft);
let MoveScreenToRightHalf = class MoveScreenToRightHalf extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["z", "H"];
        this.movementType = "right";
        this.by = "halfLine";
        this.value = 1;
    }
};
MoveScreenToRightHalf = __decorate([
    RegisterAction
], MoveScreenToRightHalf);
let MoveScreenToLeftHalf = class MoveScreenToLeftHalf extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Insert, mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["z", "L"];
        this.movementType = "left";
        this.by = "halfLine";
        this.value = 1;
    }
};
MoveScreenToLeftHalf = __decorate([
    RegisterAction
], MoveScreenToLeftHalf);
let MoveToLineFromViewPortTop = class MoveToLineFromViewPortTop extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["H"];
        this.movementType = "viewPortTop";
        this.by = "line";
        this.value = 1;
        this.canBePrefixedWithCount = true;
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            this.value = count < 1 ? 1 : count;
            return yield this.execAction(position, vimState);
        });
    }
};
MoveToLineFromViewPortTop = __decorate([
    RegisterAction
], MoveToLineFromViewPortTop);
let MoveToLineFromViewPortBottom = class MoveToLineFromViewPortBottom extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["L"];
        this.movementType = "viewPortBottom";
        this.by = "line";
        this.value = 1;
        this.canBePrefixedWithCount = true;
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            this.value = count < 1 ? 1 : count;
            return yield this.execAction(position, vimState);
        });
    }
};
MoveToLineFromViewPortBottom = __decorate([
    RegisterAction
], MoveToLineFromViewPortBottom);
let MoveToMiddleLineInViewPort = class MoveToMiddleLineInViewPort extends MoveByScreenLine {
    constructor() {
        super(...arguments);
        this.keys = ["M"];
        this.movementType = "viewPortCenter";
        this.by = "line";
    }
};
MoveToMiddleLineInViewPort = __decorate([
    RegisterAction
], MoveToMiddleLineInViewPort);
let MoveNonBlank = class MoveNonBlank extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["^"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getFirstLineNonBlankChar();
        });
    }
};
MoveNonBlank = __decorate([
    RegisterAction
], MoveNonBlank);
let MoveNextLineNonBlank = class MoveNextLineNonBlank extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["\n"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentRegisterMode = register_1.RegisterMode.LineWise;
            // Count === 0 if just pressing enter in normal mode, need to still go down 1 line
            if (count === 0) {
                count++;
            }
            return position.getDownByCount(count).getFirstLineNonBlankChar();
        });
    }
};
MoveNextLineNonBlank = __decorate([
    RegisterAction
], MoveNextLineNonBlank);
let MoveNonBlankFirst = class MoveNonBlankFirst extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["g", "g"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            if (count === 0) {
                return position.getDocumentBegin().getFirstLineNonBlankChar();
            }
            return new position_1.Position(count - 1, 0).getFirstLineNonBlankChar();
        });
    }
};
MoveNonBlankFirst = __decorate([
    RegisterAction
], MoveNonBlankFirst);
let MoveNonBlankLast = class MoveNonBlankLast extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["G"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let stop;
            if (count === 0) {
                stop = new position_1.Position(textEditor_1.TextEditor.getLineCount() - 1, 0);
            }
            else {
                stop = new position_1.Position(Math.min(count, textEditor_1.TextEditor.getLineCount()) - 1, 0);
            }
            return {
                start: vimState.cursorStartPosition,
                stop: stop,
                registerMode: register_1.RegisterMode.LineWise
            };
        });
    }
};
MoveNonBlankLast = __decorate([
    RegisterAction
], MoveNonBlankLast);
let MoveWordBegin = class MoveWordBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["w"];
    }
    execAction(position, vimState, isLastIteration = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isLastIteration && vimState.recordedState.operator instanceof ChangeOperator) {
                if (textEditor_1.TextEditor.getLineAt(position).text.length < 1) {
                    return position;
                }
                const line = textEditor_1.TextEditor.getLineAt(position).text;
                const char = line[position.character];
                /*
                From the Vim manual:
          
                Special case: "cw" and "cW" are treated like "ce" and "cE" if the cursor is
                on a non-blank.  This is because "cw" is interpreted as change-word, and a
                word does not include the following white space.
                */
                if (" \t".indexOf(char) >= 0) {
                    return position.getWordRight();
                }
                else {
                    return position.getCurrentWordEnd(true).getRight();
                }
            }
            else {
                return position.getWordRight();
            }
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.execAction(position, vimState, true);
            /*
            From the Vim documentation:
        
            Another special case: When using the "w" motion in combination with an
            operator and the last word moved over is at the end of a line, the end of
            that word becomes the end of the operated text, not the first word in the
            next line.
            */
            if (result.line > position.line + 1 || (result.line === position.line + 1 && result.isFirstWordOfLine())) {
                return position.getLineEnd();
            }
            if (result.isLineEnd()) {
                return new position_1.Position(result.line, result.character + 1);
            }
            return result;
        });
    }
};
MoveWordBegin = __decorate([
    RegisterAction
], MoveWordBegin);
exports.MoveWordBegin = MoveWordBegin;
let MoveFullWordBegin = class MoveFullWordBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["W"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vimState.recordedState.operator instanceof ChangeOperator) {
                // TODO use execForOperator? Or maybe dont?
                // See note for w
                return position.getCurrentBigWordEnd().getRight();
            }
            else {
                return position.getBigWordRight();
            }
        });
    }
};
MoveFullWordBegin = __decorate([
    RegisterAction
], MoveFullWordBegin);
let MoveWordEnd = class MoveWordEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["e"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getCurrentWordEnd();
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let end = position.getCurrentWordEnd();
            return new position_1.Position(end.line, end.character + 1);
        });
    }
};
MoveWordEnd = __decorate([
    RegisterAction
], MoveWordEnd);
let MoveFullWordEnd = class MoveFullWordEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["E"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getCurrentBigWordEnd();
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getCurrentBigWordEnd().getRight();
        });
    }
};
MoveFullWordEnd = __decorate([
    RegisterAction
], MoveFullWordEnd);
let MoveLastWordEnd = class MoveLastWordEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["g", "e"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLastWordEnd();
        });
    }
};
MoveLastWordEnd = __decorate([
    RegisterAction
], MoveLastWordEnd);
let MoveLastFullWordEnd = class MoveLastFullWordEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["g", "E"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getLastBigWordEnd();
        });
    }
};
MoveLastFullWordEnd = __decorate([
    RegisterAction
], MoveLastFullWordEnd);
let MoveBeginningWord = class MoveBeginningWord extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["b"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getWordLeft();
        });
    }
};
MoveBeginningWord = __decorate([
    RegisterAction
], MoveBeginningWord);
let MoveBeginningFullWord = class MoveBeginningFullWord extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["B"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getBigWordLeft();
        });
    }
};
MoveBeginningFullWord = __decorate([
    RegisterAction
], MoveBeginningFullWord);
let MovePreviousSentenceBegin = class MovePreviousSentenceBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["("];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getSentenceBegin({ forward: false });
        });
    }
};
MovePreviousSentenceBegin = __decorate([
    RegisterAction
], MovePreviousSentenceBegin);
let MoveNextSentenceBegin = class MoveNextSentenceBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = [")"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getSentenceBegin({ forward: true });
        });
    }
};
MoveNextSentenceBegin = __decorate([
    RegisterAction
], MoveNextSentenceBegin);
let MoveParagraphEnd = class MoveParagraphEnd extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["}"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getCurrentParagraphEnd();
        });
    }
};
MoveParagraphEnd = __decorate([
    RegisterAction
], MoveParagraphEnd);
let MoveParagraphBegin = class MoveParagraphBegin extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["{"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getCurrentParagraphBeginning();
        });
    }
};
MoveParagraphBegin = __decorate([
    RegisterAction
], MoveParagraphBegin);
class MoveSectionBoundary extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return position.getSectionBoundary({
                forward: this.forward,
                boundary: this.boundary
            });
        });
    }
}
let MoveNextSectionBegin = class MoveNextSectionBegin extends MoveSectionBoundary {
    constructor() {
        super(...arguments);
        this.keys = ["]", "]"];
        this.boundary = "{";
        this.forward = true;
    }
};
MoveNextSectionBegin = __decorate([
    RegisterAction
], MoveNextSectionBegin);
let MoveNextSectionEnd = class MoveNextSectionEnd extends MoveSectionBoundary {
    constructor() {
        super(...arguments);
        this.keys = ["]", "["];
        this.boundary = "}";
        this.forward = true;
    }
};
MoveNextSectionEnd = __decorate([
    RegisterAction
], MoveNextSectionEnd);
let MovePreviousSectionBegin = class MovePreviousSectionBegin extends MoveSectionBoundary {
    constructor() {
        super(...arguments);
        this.keys = ["[", "["];
        this.boundary = "{";
        this.forward = false;
    }
};
MovePreviousSectionBegin = __decorate([
    RegisterAction
], MovePreviousSectionBegin);
let MovePreviousSectionEnd = class MovePreviousSectionEnd extends MoveSectionBoundary {
    constructor() {
        super(...arguments);
        this.keys = ["[", "]"];
        this.boundary = "}";
        this.forward = false;
    }
};
MovePreviousSectionEnd = __decorate([
    RegisterAction
], MovePreviousSectionEnd);
let ActionDeleteChar = class ActionDeleteChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["x"];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // If line is empty, do nothing
            if (textEditor_1.TextEditor.getLineAt(position).text.length < 1) {
                return vimState;
            }
            const state = yield new DeleteOperator(this.multicursorIndex).run(vimState, position, position);
            state.currentMode = mode_1.ModeName.Normal;
            return state;
        });
    }
};
ActionDeleteChar = __decorate([
    RegisterAction
], ActionDeleteChar);
let ActionDeleteCharWithDeleteKey = class ActionDeleteCharWithDeleteKey extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<Del>"];
        this.runsOnceForEachCountPrefix = true;
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // N<del> is a no-op in Vim
            if (vimState.recordedState.count !== 0) {
                return vimState;
            }
            const state = yield new DeleteOperator(this.multicursorIndex).run(vimState, position, position);
            state.currentMode = mode_1.ModeName.Normal;
            return state;
        });
    }
};
ActionDeleteCharWithDeleteKey = __decorate([
    RegisterAction
], ActionDeleteCharWithDeleteKey);
let ActionDeleteLastChar = class ActionDeleteLastChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["X"];
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (position.character === 0) {
                return vimState;
            }
            return yield new DeleteOperator(this.multicursorIndex).run(vimState, position.getLeft(), position.getLeft());
        });
    }
};
ActionDeleteLastChar = __decorate([
    RegisterAction
], ActionDeleteLastChar);
let ActionJoin = class ActionJoin extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["J"];
        this.canBeRepeatedWithDot = true;
        this.runsOnceForEachCountPrefix = false;
    }
    firstNonWhitespaceIndex(str) {
        for (let i = 0, len = str.length; i < len; i++) {
            let chCode = str.charCodeAt(i);
            if (chCode !== 32 /** space */ && chCode !== 9 /** tab */) {
                return i;
            }
        }
        return -1;
    }
    execJoinLines(startPosition, position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            count = count - 1 || 1;
            let startLineNumber, startColumn, endLineNumber, endColumn, columnDeltaOffset = 0;
            if (startPosition.isEqual(position) || startPosition.line === position.line) {
                if (position.line + 1 < textEditor_1.TextEditor.getLineCount()) {
                    startLineNumber = position.line;
                    startColumn = 0;
                    endLineNumber = startLineNumber + count;
                    endColumn = textEditor_1.TextEditor.getLineMaxColumn(endLineNumber);
                }
                else {
                    startLineNumber = position.line;
                    startColumn = 0;
                    endLineNumber = position.line;
                    endColumn = textEditor_1.TextEditor.getLineMaxColumn(endLineNumber);
                }
            }
            else {
                startLineNumber = startPosition.line;
                startColumn = 0;
                endLineNumber = position.line;
                endColumn = textEditor_1.TextEditor.getLineMaxColumn(endLineNumber);
            }
            let trimmedLinesContent = textEditor_1.TextEditor.getLineAt(startPosition).text;
            for (let i = startLineNumber + 1; i <= endLineNumber; i++) {
                let lineText = textEditor_1.TextEditor.getLineAt(new position_1.Position(i, 0)).text;
                let firstNonWhitespaceIdx = this.firstNonWhitespaceIndex(lineText);
                if (firstNonWhitespaceIdx >= 0) {
                    let insertSpace = true;
                    if (trimmedLinesContent === '' ||
                        trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === ' ' ||
                        trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === '\t') {
                        insertSpace = false;
                    }
                    let lineTextWithoutIndent = lineText.substr(firstNonWhitespaceIdx);
                    if (lineTextWithoutIndent.charAt(0) === ')') {
                        insertSpace = false;
                    }
                    trimmedLinesContent += (insertSpace ? ' ' : '') + lineTextWithoutIndent;
                    if (insertSpace) {
                        columnDeltaOffset = lineTextWithoutIndent.length + 1;
                    }
                    else {
                        columnDeltaOffset = lineTextWithoutIndent.length;
                    }
                }
                else {
                    if (trimmedLinesContent === '' ||
                        trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === ' ' ||
                        trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === '\t') {
                        columnDeltaOffset += 0;
                    }
                    else {
                        trimmedLinesContent += ' ';
                        columnDeltaOffset += 1;
                    }
                }
            }
            let deleteStartPosition = new position_1.Position(startLineNumber, startColumn);
            let deleteEndPosition = new position_1.Position(endLineNumber, endColumn);
            if (!deleteStartPosition.isEqual(deleteEndPosition)) {
                if (startPosition.isEqual(position)) {
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: trimmedLinesContent,
                        start: deleteStartPosition,
                        end: deleteEndPosition,
                        diff: new position_1.PositionDiff(0, trimmedLinesContent.length - columnDeltaOffset - position.character),
                    });
                }
                else {
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: trimmedLinesContent,
                        start: deleteStartPosition,
                        end: deleteEndPosition,
                        manuallySetCursorPositions: true
                    });
                    vimState.cursorPosition = new position_1.Position(startPosition.line, trimmedLinesContent.length - columnDeltaOffset);
                    vimState.cursorStartPosition = vimState.cursorPosition;
                    vimState.currentMode = mode_1.ModeName.Normal;
                }
            }
            return vimState;
        });
    }
    execCount(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            let resultingCursors = [];
            let i = 0;
            const cursorsToIterateOver = vimState.allCursors
                .map(x => new range_1.Range(x.start, x.stop))
                .sort((a, b) => a.start.line > b.start.line || (a.start.line === b.start.line && a.start.character > b.start.character) ? 1 : -1);
            for (const { start, stop } of cursorsToIterateOver) {
                this.multicursorIndex = i++;
                vimState.cursorPosition = stop;
                vimState.cursorStartPosition = start;
                vimState = yield this.execJoinLines(start, stop, vimState, timesToRepeat);
                resultingCursors.push(new range_1.Range(vimState.cursorStartPosition, vimState.cursorPosition));
                for (const transformation of vimState.recordedState.transformations) {
                    if (transformations_1.isTextTransformation(transformation) && transformation.cursorIndex === undefined) {
                        transformation.cursorIndex = this.multicursorIndex;
                    }
                }
            }
            vimState.allCursors = resultingCursors;
            return vimState;
        });
    }
};
ActionJoin = __decorate([
    RegisterAction
], ActionJoin);
let ActionJoinVisualMode = class ActionJoinVisualMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["J"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionJoin = new ActionJoin();
            let start = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            let end = position_1.Position.FromVSCodePosition(vimState.editor.selection.end);
            if (start.isAfter(end)) {
                [start, end] = [end, start];
            }
            /**
             * For joining lines, Visual Line behaves the same as Visual so we align the register mode here.
             */
            vimState.currentRegisterMode = register_1.RegisterMode.CharacterWise;
            vimState = yield actionJoin.execJoinLines(start, end, vimState, 1);
            return vimState;
        });
    }
};
ActionJoinVisualMode = __decorate([
    RegisterAction
], ActionJoinVisualMode);
let ActionVisualReflowParagraph = ActionVisualReflowParagraph_1 = class ActionVisualReflowParagraph extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["g", "q"];
    }
    getIndentationLevel(s) {
        for (const line of s.split("\n")) {
            const result = line.match(/^\s+/g);
            const indentLevel = result ? result[0].length : 0;
            if (indentLevel !== line.length) {
                return indentLevel;
            }
        }
        return 0;
    }
    reflowParagraph(s, indentLevel) {
        const maximumLineLength = configuration_1.Configuration.textwidth - indentLevel - 2;
        const indent = Array(indentLevel + 1).join(" ");
        // Chunk the lines by commenting style.
        let chunksToReflow = [];
        for (const line of s.split("\n")) {
            let lastChunk = chunksToReflow[chunksToReflow.length - 1];
            const trimmedLine = line.trim();
            // See what comment type they are using.
            let commentType;
            for (const type of ActionVisualReflowParagraph_1.CommentTypes) {
                if (line.trim().startsWith(type.start)) {
                    commentType = type;
                    break;
                }
                // If they're currently in a multiline comment, see if they continued it.
                if (lastChunk && type.start === lastChunk.commentType.start && !type.singleLine) {
                    if (line.trim().startsWith(type.inner)) {
                        commentType = type;
                        break;
                    }
                    if (line.trim().endsWith(type.final)) {
                        commentType = type;
                        break;
                    }
                }
            }
            if (!commentType) {
                break;
            } // will never happen, just to satisfy typechecker.
            // Did they start a new comment type?
            if (!lastChunk || commentType.start !== lastChunk.commentType.start) {
                chunksToReflow.push({
                    commentType,
                    content: `${trimmedLine.substr(commentType.start.length).trim()}`
                });
                continue;
            }
            // Parse out commenting style, gather words.
            lastChunk = chunksToReflow[chunksToReflow.length - 1];
            if (lastChunk.commentType.singleLine) {
                lastChunk.content += `\n${trimmedLine.substr(lastChunk.commentType.start.length).trim()}`;
            }
            else {
                if (trimmedLine.endsWith(lastChunk.commentType.final)) {
                    if (trimmedLine.length > lastChunk.commentType.final.length) {
                        lastChunk.content += `\n${trimmedLine.substr(lastChunk.commentType.inner.length, trimmedLine.length - lastChunk.commentType.final.length).trim()}`;
                    }
                }
                else if (trimmedLine.startsWith(lastChunk.commentType.inner)) {
                    lastChunk.content += `\n${trimmedLine.substr(lastChunk.commentType.inner.length).trim()}`;
                }
                else if (trimmedLine.startsWith(lastChunk.commentType.start)) {
                    lastChunk.content += `\n${trimmedLine.substr(lastChunk.commentType.start.length).trim()}`;
                }
            }
        }
        // Reflow each chunk.
        let result = [];
        for (const { commentType, content } of chunksToReflow) {
            let lines;
            if (commentType.singleLine) {
                lines = [``];
            }
            else {
                lines = [``, ``];
            }
            for (const line of content.trim().split("\n")) {
                // Preserve newlines.
                if (line.trim() === "") {
                    for (let i = 0; i < 2; i++) {
                        lines.push(``);
                    }
                    continue;
                }
                // Add word by word, wrapping when necessary.
                for (const word of line.split(/\s+/)) {
                    if (word === "") {
                        continue;
                    }
                    if (lines[lines.length - 1].length + word.length + 1 < maximumLineLength) {
                        lines[lines.length - 1] += ` ${word}`;
                    }
                    else {
                        lines.push(` ${word}`);
                    }
                }
            }
            if (!commentType.singleLine) {
                lines.push(``);
            }
            if (commentType.singleLine) {
                if (lines.length > 1 && lines[0].trim() === "") {
                    lines = lines.slice(1);
                }
                if (lines.length > 1 && lines[lines.length - 1].trim() === "") {
                    lines = lines.slice(0, -1);
                }
            }
            for (let i = 0; i < lines.length; i++) {
                if (commentType.singleLine) {
                    lines[i] = `${indent}${commentType.start}${lines[i]}`;
                }
                else {
                    if (i === 0) {
                        lines[i] = `${indent}${commentType.start}${lines[i]}`;
                    }
                    else if (i === lines.length - 1) {
                        lines[i] = `${indent} ${commentType.final}`;
                    }
                    else {
                        lines[i] = `${indent} ${commentType.inner}${lines[i]}`;
                    }
                }
            }
            result = result.concat(lines);
        }
        // Remove extra first space if it exists.
        if (result[0][0] === " ") {
            result[0] = result[0].slice(1);
        }
        // Gather up multiple empty lines into single empty lines.
        return result.join("\n");
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const rangeStart = position_1.Position.EarlierOf(vimState.cursorPosition, vimState.cursorStartPosition);
            const rangeStop = position_1.Position.LaterOf(vimState.cursorPosition, vimState.cursorStartPosition);
            let textToReflow = textEditor_1.TextEditor.getText(new vscode.Range(rangeStart, rangeStop));
            let indentLevel = this.getIndentationLevel(textToReflow);
            textToReflow = this.reflowParagraph(textToReflow, indentLevel);
            vimState.recordedState.transformations.push({
                type: "replaceText",
                text: textToReflow,
                start: vimState.cursorStartPosition,
                end: vimState.cursorPosition,
                // Move cursor to front of line to realign the view
                diff: position_1.PositionDiff.NewBOLDiff(0, 0)
            });
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ActionVisualReflowParagraph.CommentTypes = [
    { singleLine: true, start: "///" },
    { singleLine: true, start: "//" },
    { singleLine: true, start: "--" },
    { singleLine: true, start: "#" },
    { singleLine: true, start: ";" },
    { singleLine: false, start: "/**", inner: "*", final: "*/" },
    { singleLine: false, start: "/*", inner: "*", final: "*/" },
    { singleLine: false, start: "{-", inner: "-", final: "-}" },
    // Needs to come last, since everything starts with the emtpy string!
    { singleLine: true, start: "" },
];
ActionVisualReflowParagraph = ActionVisualReflowParagraph_1 = __decorate([
    RegisterAction
], ActionVisualReflowParagraph);
let ActionJoinNoWhitespace = class ActionJoinNoWhitespace extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", "J"];
        this.canBeRepeatedWithDot = true;
        this.runsOnceForEachCountPrefix = true;
    }
    // gJ is essentially J without the edge cases. ;-)
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (position.line === textEditor_1.TextEditor.getLineCount() - 1) {
                return vimState; // TODO: bell
            }
            let lineOne = textEditor_1.TextEditor.getLineAt(position).text;
            let lineTwo = textEditor_1.TextEditor.getLineAt(position.getNextLineBegin()).text;
            lineTwo = lineTwo.substring(position.getNextLineBegin().getFirstLineNonBlankChar().character);
            let resultLine = lineOne + lineTwo;
            let newState = yield new DeleteOperator(this.multicursorIndex).run(vimState, position.getLineBegin(), lineTwo.length > 0 ?
                position.getNextLineBegin().getLineEnd().getLeft() :
                position.getLineEnd());
            vimState.recordedState.transformations.push({
                type: "insertText",
                text: resultLine,
                position: position,
                diff: new position_1.PositionDiff(0, -lineTwo.length),
            });
            newState.cursorPosition = new position_1.Position(position.line, lineOne.length);
            return newState;
        });
    }
};
ActionJoinNoWhitespace = __decorate([
    RegisterAction
], ActionJoinNoWhitespace);
let ActionJoinNoWhitespaceVisualMode = class ActionJoinNoWhitespaceVisualMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual];
        this.keys = ["g", "J"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionJoin = new ActionJoinNoWhitespace();
            let start = position_1.Position.FromVSCodePosition(vimState.editor.selection.start);
            let end = position_1.Position.FromVSCodePosition(vimState.editor.selection.end);
            if (start.line === end.line) {
                return vimState;
            }
            if (start.isAfter(end)) {
                [start, end] = [end, start];
            }
            for (let i = start.line; i < end.line; i++) {
                vimState = yield actionJoin.exec(start, vimState);
            }
            return vimState;
        });
    }
};
ActionJoinNoWhitespaceVisualMode = __decorate([
    RegisterAction
], ActionJoinNoWhitespaceVisualMode);
let ActionReplaceCharacter = class ActionReplaceCharacter extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["r", "<character>"];
        this.canBeRepeatedWithDot = true;
        this.runsOnceForEachCountPrefix = false;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let timesToRepeat = vimState.recordedState.count || 1;
            const toReplace = this.keysPressed[1];
            /**
             * <character> includes <BS>, <SHIFT+BS> and <TAB> but not any control keys,
             * so we ignore the former two keys and have a special handle for <tab>.
             */
            if (['<BS>', '<SHIFT+BS>'].indexOf(toReplace.toUpperCase()) >= 0) {
                return vimState;
            }
            if (position.character + timesToRepeat > position.getLineEnd().character) {
                return vimState;
            }
            let endPos = new position_1.Position(position.line, position.character + timesToRepeat);
            // Return if tried to repeat longer than linelength
            if (endPos.character > textEditor_1.TextEditor.getLineAt(endPos).text.length) {
                return vimState;
            }
            // If last char (not EOL char), add 1 so that replace selection is complete
            if (endPos.character > textEditor_1.TextEditor.getLineAt(endPos).text.length) {
                endPos = new position_1.Position(endPos.line, endPos.character + 1);
            }
            if (toReplace === '<tab>') {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(position, endPos)
                });
                vimState.recordedState.transformations.push({
                    type: "tab",
                    cursorIndex: this.multicursorIndex,
                    diff: new position_1.PositionDiff(0, -1)
                });
            }
            else {
                vimState.recordedState.transformations.push({
                    type: "replaceText",
                    text: toReplace.repeat(timesToRepeat),
                    start: position,
                    end: endPos,
                    diff: new position_1.PositionDiff(0, timesToRepeat - 1),
                });
            }
            return vimState;
        });
    }
    execCount(position, vimState) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return _super("execCount").call(this, position, vimState);
        });
    }
};
ActionReplaceCharacter = __decorate([
    RegisterAction
], ActionReplaceCharacter);
let ActionReplaceCharacterVisual = class ActionReplaceCharacterVisual extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["r", "<character>"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const toInsert = this.keysPressed[1];
            let visualSelectionOffset = 1;
            let start = vimState.cursorStartPosition;
            let end = vimState.cursorPosition;
            // If selection is reversed, reorganize it so that the text replace logic always works
            if (end.isBeforeOrEqual(start)) {
                [start, end] = [end, start];
            }
            // Limit to not replace EOL
            const textLength = textEditor_1.TextEditor.getLineAt(end).text.length;
            if (textLength <= 0) {
                visualSelectionOffset = 0;
            }
            end = new position_1.Position(end.line, Math.min(end.character, textLength > 0 ? textLength - 1 : 0));
            // Iterate over every line in the current selection
            for (var lineNum = start.line; lineNum <= end.line; lineNum++) {
                // Get line of text
                const lineText = textEditor_1.TextEditor.getLineAt(new position_1.Position(lineNum, 0)).text;
                if (start.line === end.line) {
                    // This is a visual section all on one line, only replace the part within the selection
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: Array(end.character - start.character + 2).join(toInsert),
                        start: start,
                        end: new position_1.Position(end.line, end.character + 1),
                        manuallySetCursorPositions: true
                    });
                }
                else if (lineNum === start.line) {
                    // This is the first line of the selection so only replace after the cursor
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: Array(lineText.length - start.character + 1).join(toInsert),
                        start: start,
                        end: new position_1.Position(start.line, lineText.length),
                        manuallySetCursorPositions: true
                    });
                }
                else if (lineNum === end.line) {
                    // This is the last line of the selection so only replace before the cursor
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: Array(end.character + 1 + visualSelectionOffset).join(toInsert),
                        start: new position_1.Position(end.line, 0),
                        end: new position_1.Position(end.line, end.character + visualSelectionOffset),
                        manuallySetCursorPositions: true
                    });
                }
                else {
                    // Replace the entire line length since it is in the middle of the selection
                    vimState.recordedState.transformations.push({
                        type: "replaceText",
                        text: Array(lineText.length + 1).join(toInsert),
                        start: new position_1.Position(lineNum, 0),
                        end: new position_1.Position(lineNum, lineText.length),
                        manuallySetCursorPositions: true
                    });
                }
            }
            vimState.cursorPosition = start;
            vimState.cursorStartPosition = start;
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ActionReplaceCharacterVisual = __decorate([
    RegisterAction
], ActionReplaceCharacterVisual);
let ActionReplaceCharacterVisualBlock = class ActionReplaceCharacterVisualBlock extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["r", "<character>"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const toInsert = this.keysPressed[1];
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                if (end.isBeforeOrEqual(start)) {
                    continue;
                }
                vimState.recordedState.transformations.push({
                    type: "replaceText",
                    text: Array(end.character - start.character + 1).join(toInsert),
                    start: start,
                    end: end,
                    manuallySetCursorPositions: true
                });
            }
            const topLeft = modeVisualBlock_1.VisualBlockMode.getTopLeftPosition(vimState.cursorPosition, vimState.cursorStartPosition);
            vimState.allCursors = [new range_1.Range(topLeft, topLeft)];
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ActionReplaceCharacterVisualBlock = __decorate([
    RegisterAction
], ActionReplaceCharacterVisualBlock);
let ActionXVisualBlock = class ActionXVisualBlock extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["x"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(start, end),
                    manuallySetCursorPositions: true,
                });
            }
            const topLeft = modeVisualBlock_1.VisualBlockMode.getTopLeftPosition(vimState.cursorPosition, vimState.cursorStartPosition);
            vimState.allCursors = [new range_1.Range(topLeft, topLeft)];
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ActionXVisualBlock = __decorate([
    RegisterAction
], ActionXVisualBlock);
let ActionDVisualBlock = class ActionDVisualBlock extends ActionXVisualBlock {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["d"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
};
ActionDVisualBlock = __decorate([
    RegisterAction
], ActionDVisualBlock);
let ActionShiftDVisualBlock = class ActionShiftDVisualBlock extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["D"];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start } of position_1.Position.IterateLine(vimState)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(start, start.getLineEnd()),
                    manuallySetCursorPositions: true,
                });
            }
            const topLeft = modeVisualBlock_1.VisualBlockMode.getTopLeftPosition(vimState.cursorPosition, vimState.cursorStartPosition);
            vimState.allCursors = [new range_1.Range(topLeft, topLeft)];
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ActionShiftDVisualBlock = __decorate([
    RegisterAction
], ActionShiftDVisualBlock);
let ActionSVisualBlock = class ActionSVisualBlock extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = [["s"], ["S"]];
        this.canBeRepeatedWithDot = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(start, end),
                    manuallySetCursorPositions: true,
                });
            }
            vimState.currentMode = mode_1.ModeName.VisualBlockInsertMode;
            vimState.recordedState.visualBlockInsertionType = modeVisualBlock_2.VisualBlockInsertionType.Insert;
            // Make sure the cursor position is at the beginning since we are inserting not appending
            if (vimState.cursorPosition.character > vimState.cursorStartPosition.character) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure we are in the TOP left
            if (vimState.cursorPosition.line > vimState.cursorStartPosition.line) {
                let lineStart = vimState.cursorStartPosition.line;
                vimState.cursorStartPosition = new position_1.Position(vimState.cursorPosition.line, vimState.cursorStartPosition.character);
                vimState.cursorPosition = new position_1.Position(lineStart, vimState.cursorPosition.character);
            }
            return vimState;
        });
    }
};
ActionSVisualBlock = __decorate([
    RegisterAction
], ActionSVisualBlock);
let ActionGoToInsertVisualBlockMode = class ActionGoToInsertVisualBlockMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["I"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.VisualBlockInsertMode;
            vimState.recordedState.visualBlockInsertionType = modeVisualBlock_2.VisualBlockInsertionType.Insert;
            // Make sure the cursor position is at the beginning since we are inserting not appending
            if (vimState.cursorPosition.character > vimState.cursorStartPosition.character) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure we are in the TOP left
            if (vimState.cursorPosition.line > vimState.cursorStartPosition.line) {
                let lineStart = vimState.cursorStartPosition.line;
                vimState.cursorStartPosition = new position_1.Position(vimState.cursorPosition.line, vimState.cursorStartPosition.character);
                vimState.cursorPosition = new position_1.Position(lineStart, vimState.cursorPosition.character);
            }
            return vimState;
        });
    }
};
ActionGoToInsertVisualBlockMode = __decorate([
    RegisterAction
], ActionGoToInsertVisualBlockMode);
let ActionChangeInVisualBlockMode = class ActionChangeInVisualBlockMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["c"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(start, end),
                    manuallySetCursorPositions: true,
                });
            }
            vimState.currentMode = mode_1.ModeName.VisualBlockInsertMode;
            vimState.recordedState.visualBlockInsertionType = modeVisualBlock_2.VisualBlockInsertionType.Insert;
            // Make sure the cursor position is at the beginning since we are inserting not appending
            if (vimState.cursorPosition.character > vimState.cursorStartPosition.character) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure we are in the TOP left
            if (vimState.cursorPosition.line > vimState.cursorStartPosition.line) {
                let lineStart = vimState.cursorStartPosition.line;
                vimState.cursorStartPosition = new position_1.Position(vimState.cursorPosition.line, vimState.cursorStartPosition.character);
                vimState.cursorPosition = new position_1.Position(lineStart, vimState.cursorPosition.character);
            }
            return vimState;
        });
    }
};
ActionChangeInVisualBlockMode = __decorate([
    RegisterAction
], ActionChangeInVisualBlockMode);
// TODO - this is basically a duplicate of the above command
let ActionChangeToEOLInVisualBlockMode = class ActionChangeToEOLInVisualBlockMode extends BaseCommand {
    // TODO - this is basically a duplicate of the above command
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["C"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start } of position_1.Position.IterateLine(vimState)) {
                vimState.recordedState.transformations.push({
                    type: "deleteRange",
                    range: new range_1.Range(start, start.getLineEnd()),
                    collapseRange: true
                });
            }
            vimState.currentMode = mode_1.ModeName.VisualBlockInsertMode;
            vimState.recordedState.visualBlockInsertionType = modeVisualBlock_2.VisualBlockInsertionType.Insert;
            // Make sure the cursor position is at the end since we are appending
            if (vimState.cursorPosition.character < vimState.cursorStartPosition.character) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure we are in the TOP right
            if (vimState.cursorPosition.line > vimState.cursorStartPosition.line) {
                let lineStart = vimState.cursorStartPosition.line;
                vimState.cursorStartPosition = new position_1.Position(vimState.cursorPosition.line, vimState.cursorStartPosition.character);
                vimState.cursorPosition = new position_1.Position(lineStart, vimState.cursorPosition.character);
            }
            vimState.cursorPosition = vimState.cursorPosition.getRight();
            return vimState;
        });
    }
};
ActionChangeToEOLInVisualBlockMode = __decorate([
    RegisterAction
], ActionChangeToEOLInVisualBlockMode);
let ActionGoToInsertVisualBlockModeAppend = class ActionGoToInsertVisualBlockModeAppend extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlock];
        this.keys = ["A"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.currentMode = mode_1.ModeName.VisualBlockInsertMode;
            vimState.recordedState.visualBlockInsertionType = modeVisualBlock_2.VisualBlockInsertionType.Append;
            // Make sure the cursor position is at the end since we are appending
            if (vimState.cursorPosition.character < vimState.cursorStartPosition.character) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure we are in the TOP right
            if (vimState.cursorPosition.line > vimState.cursorStartPosition.line) {
                let lineStart = vimState.cursorStartPosition.line;
                vimState.cursorStartPosition = new position_1.Position(vimState.cursorPosition.line, vimState.cursorStartPosition.character);
                vimState.cursorPosition = new position_1.Position(lineStart, vimState.cursorPosition.character);
            }
            vimState.cursorPosition = vimState.cursorPosition.getRight();
            return vimState;
        });
    }
};
ActionGoToInsertVisualBlockModeAppend = __decorate([
    RegisterAction
], ActionGoToInsertVisualBlockModeAppend);
let YankVisualBlockMode = class YankVisualBlockMode extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["y"];
        this.modes = [mode_1.ModeName.VisualBlock];
        this.canBeRepeatedWithDot = false;
    }
    runsOnceForEveryCursor() { return false; }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            let toCopy = "";
            for (const { line } of position_1.Position.IterateLine(vimState)) {
                toCopy += line + '\n';
            }
            register_1.Register.put(toCopy, vimState, this.multicursorIndex);
            vimState.currentMode = mode_1.ModeName.Normal;
            vimState.cursorPosition = start;
            return vimState;
        });
    }
};
YankVisualBlockMode = __decorate([
    RegisterAction
], YankVisualBlockMode);
exports.YankVisualBlockMode = YankVisualBlockMode;
let InsertInInsertVisualBlockMode = class InsertInInsertVisualBlockMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.VisualBlockInsertMode];
        this.keys = ["<any>"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            let char = this.keysPressed[0];
            let insertAtStart = vimState.recordedState.visualBlockInsertionType === modeVisualBlock_2.VisualBlockInsertionType.Insert;
            if (char === '\n') {
                return vimState;
            }
            if (char === '<BS>' && vimState.topLeft.character === 0) {
                return vimState;
            }
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                const insertPos = insertAtStart ? start : end;
                // Skip line if starting position does not have content (don't insert on blank lines for example)
                if (end.isBefore(start)) {
                    continue;
                }
                if (char === '<BS>') {
                    vimState.recordedState.transformations.push({
                        type: "deleteText",
                        position: insertPos,
                        diff: new position_1.PositionDiff(0, -1),
                    });
                }
                else {
                    let positionToInsert;
                    if (vimState.recordedState.visualBlockInsertionType === modeVisualBlock_2.VisualBlockInsertionType.Append) {
                        positionToInsert = insertPos.getLeft();
                    }
                    else {
                        positionToInsert = insertPos;
                    }
                    vimState.recordedState.transformations.push({
                        type: "insertText",
                        text: char,
                        position: positionToInsert,
                        diff: new position_1.PositionDiff(0, 1),
                    });
                }
            }
            return vimState;
        });
    }
};
InsertInInsertVisualBlockMode = __decorate([
    RegisterAction
], InsertInInsertVisualBlockMode);
// DOUBLE MOTIONS
// (dd yy cc << >> ==)
// These work because there is a check in does/couldActionApply where
// you can't run an operator if you already have one going (which is logical).
// However there is the slightly weird behavior where dy actually deletes the whole
// line, lol.
let MoveDD = class MoveDD extends BaseMovement {
    // DOUBLE MOTIONS
    // (dd yy cc << >> ==)
    // These work because there is a check in does/couldActionApply where
    // you can't run an operator if you already have one going (which is logical).
    // However there is the slightly weird behavior where dy actually deletes the whole
    // line, lol.
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["d"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getDownByCount(Math.max(0, count - 1)).getLineEnd(),
                registerMode: register_1.RegisterMode.LineWise
            };
        });
    }
};
MoveDD = __decorate([
    RegisterAction
], MoveDD);
let MoveYY = class MoveYY extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["y"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getDownByCount(Math.max(0, count - 1)).getLineEnd(),
                registerMode: register_1.RegisterMode.LineWise,
            };
        });
    }
};
MoveYY = __decorate([
    RegisterAction
], MoveYY);
let MoveCC = class MoveCC extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["c"];
    }
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const lineIsAllWhitespace = textEditor_1.TextEditor.getLineAt(position).text.trim() === "";
            if (lineIsAllWhitespace) {
                return {
                    start: position.getLineBegin(),
                    stop: position.getDownByCount(Math.max(0, count - 1)).getLineEnd(),
                    registerMode: register_1.RegisterMode.CharacterWise
                };
            }
            else {
                return {
                    start: position.getLineBeginRespectingIndent(),
                    stop: position.getDownByCount(Math.max(0, count - 1)).getLineEnd(),
                    registerMode: register_1.RegisterMode.CharacterWise
                };
            }
        });
    }
};
MoveCC = __decorate([
    RegisterAction
], MoveCC);
let MoveIndent = class MoveIndent extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = [">"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getLineEnd(),
            };
        });
    }
};
MoveIndent = __decorate([
    RegisterAction
], MoveIndent);
let MoveOutdent = class MoveOutdent extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["<"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getLineEnd(),
            };
        });
    }
};
MoveOutdent = __decorate([
    RegisterAction
], MoveOutdent);
let MoveFormat = class MoveFormat extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["="];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getLineEnd(),
            };
        });
    }
};
MoveFormat = __decorate([
    RegisterAction
], MoveFormat);
// Used for gUU
let MoveUpercaseLine = class MoveUpercaseLine extends BaseMovement {
    // Used for gUU
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["U"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getLineEnd(),
            };
        });
    }
};
MoveUpercaseLine = __decorate([
    RegisterAction
], MoveUpercaseLine);
// Used for guu
let MoveLowercaseLine = class MoveLowercaseLine extends BaseMovement {
    // Used for guu
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["u"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                start: position.getLineBegin(),
                stop: position.getLineEnd(),
            };
        });
    }
};
MoveLowercaseLine = __decorate([
    RegisterAction
], MoveLowercaseLine);
let ActionDeleteLineVisualMode = class ActionDeleteLineVisualMode extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["X"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new DeleteOperator(this.multicursorIndex).run(vimState, position.getLineBegin(), position.getLineEnd());
        });
    }
};
ActionDeleteLineVisualMode = __decorate([
    RegisterAction
], ActionDeleteLineVisualMode);
let ActionChangeChar = class ActionChangeChar extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["s"];
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield new ChangeOperator().run(vimState, position, position);
            state.currentMode = mode_1.ModeName.Insert;
            return state;
        });
    }
    // Don't clash with surround mode!
    doesActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) &&
            !vimState.recordedState.operator;
    }
    couldActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) &&
            !vimState.recordedState.operator;
    }
};
ActionChangeChar = __decorate([
    RegisterAction
], ActionChangeChar);
let MoveToMatchingBracket = MoveToMatchingBracket_1 = class MoveToMatchingBracket extends BaseMovement {
    constructor() {
        super(...arguments);
        this.keys = ["%"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            position = position.getLeftIfEOL();
            const text = textEditor_1.TextEditor.getLineAt(position).text;
            const charToMatch = text[position.character];
            const toFind = matcher_1.PairMatcher.pairings[charToMatch];
            const failure = { start: position, stop: position, failed: true };
            if (!toFind || !toFind.matchesWithPercentageMotion) {
                // If we're not on a match, go right until we find a
                // pairable character or hit the end of line.
                for (let i = position.character; i < text.length; i++) {
                    if (matcher_1.PairMatcher.pairings[text[i]]) {
                        // We found an opening char, now move to the matching closing char
                        const openPosition = new position_1.Position(position.line, i);
                        const result = matcher_1.PairMatcher.nextPairedChar(openPosition, text[i], true);
                        if (!result) {
                            return failure;
                        }
                        return result;
                    }
                }
                return failure;
            }
            const result = matcher_1.PairMatcher.nextPairedChar(position, charToMatch, true);
            if (!result) {
                return failure;
            }
            return result;
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.execAction(position, vimState);
            if (isIMovement(result)) {
                if (result.failed) {
                    return result;
                }
                else {
                    throw new Error("Did not ever handle this case!");
                }
            }
            if (position.compareTo(result) > 0) {
                return {
                    start: result,
                    stop: position.getRight(),
                };
            }
            else {
                return result.getRight();
            }
        });
    }
    execActionWithCount(position, vimState, count) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            // % has a special mode that lets you use it to jump to a percentage of the file
            // However, some other bracket motions inherit from this so only do this behavior for % explicitly
            if (Object.getPrototypeOf(this) === MoveToMatchingBracket_1.prototype) {
                if (count === 0) {
                    if (vimState.recordedState.operator) {
                        return this.execActionForOperator(position, vimState);
                    }
                    else {
                        return this.execAction(position, vimState);
                    }
                }
                // Check to make sure this is a valid percentage
                if (count < 0 || count > 100) {
                    return { start: position, stop: position, failed: true };
                }
                const targetLine = Math.round((count * textEditor_1.TextEditor.getLineCount()) / 100);
                return new position_1.Position(targetLine - 1, 0).getFirstLineNonBlankChar();
            }
            else {
                return _super("execActionWithCount").call(this, position, vimState, count);
            }
        });
    }
};
MoveToMatchingBracket = MoveToMatchingBracket_1 = __decorate([
    RegisterAction
], MoveToMatchingBracket);
class MoveInsideCharacter extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.includeSurrounding = false;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const failure = { start: position, stop: position, failed: true };
            const text = textEditor_1.TextEditor.getLineAt(position).text;
            const closingChar = matcher_1.PairMatcher.pairings[this.charToMatch].match;
            const closedMatch = text[position.character] === closingChar;
            // First, search backwards for the opening character of the sequence
            let startPos = matcher_1.PairMatcher.nextPairedChar(position, closingChar, closedMatch);
            if (startPos === undefined) {
                return failure;
            }
            let startPlusOne;
            if (startPos.isAfterOrEqual(startPos.getLineEnd().getLeft())) {
                startPlusOne = new position_1.Position(startPos.line + 1, 0);
            }
            else {
                startPlusOne = new position_1.Position(startPos.line, startPos.character + 1);
            }
            let endPos = matcher_1.PairMatcher.nextPairedChar(startPlusOne, this.charToMatch, false);
            if (endPos === undefined) {
                return failure;
            }
            if (this.includeSurrounding) {
                if (vimState.currentMode !== mode_1.ModeName.Visual) {
                    endPos = new position_1.Position(endPos.line, endPos.character + 1);
                }
            }
            else {
                startPos = startPlusOne;
                if (vimState.currentMode === mode_1.ModeName.Visual) {
                    endPos = endPos.getLeftThroughLineBreaks();
                }
            }
            // If the closing character is the first on the line, don't swallow it.
            if (!this.includeSurrounding) {
                if (endPos.character === 0 && vimState.currentMode !== mode_1.ModeName.Visual) {
                    endPos = endPos.getLeftThroughLineBreaks();
                }
                else if (endPos.getLeft().isInLeadingWhitespace()) {
                    endPos = endPos.getPreviousLineBegin().getLineEnd();
                }
            }
            if (position.isBefore(startPos)) {
                vimState.recordedState.operatorPositionDiff = startPos.subtract(position);
            }
            return {
                start: startPos,
                stop: endPos,
                diff: new position_1.PositionDiff(0, startPos === position ? 1 : 0)
            };
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.execAction(position, vimState);
            if (isIMovement(result)) {
                if (result.failed) {
                    vimState.recordedState.hasRunOperator = false;
                    vimState.recordedState.actionsRun = [];
                }
            }
            return result;
        });
    }
}
exports.MoveInsideCharacter = MoveInsideCharacter;
let MoveIParentheses = class MoveIParentheses extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "("];
        this.charToMatch = "(";
    }
};
MoveIParentheses = __decorate([
    RegisterAction
], MoveIParentheses);
let MoveIClosingParentheses = class MoveIClosingParentheses extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", ")"];
        this.charToMatch = "(";
    }
};
MoveIClosingParentheses = __decorate([
    RegisterAction
], MoveIClosingParentheses);
let MoveIClosingParenthesesBlock = class MoveIClosingParenthesesBlock extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "b"];
        this.charToMatch = "(";
    }
};
MoveIClosingParenthesesBlock = __decorate([
    RegisterAction
], MoveIClosingParenthesesBlock);
let MoveAParentheses = class MoveAParentheses extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "("];
        this.charToMatch = "(";
        this.includeSurrounding = true;
    }
};
MoveAParentheses = __decorate([
    RegisterAction
], MoveAParentheses);
exports.MoveAParentheses = MoveAParentheses;
let MoveAClosingParentheses = class MoveAClosingParentheses extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", ")"];
        this.charToMatch = "(";
        this.includeSurrounding = true;
    }
};
MoveAClosingParentheses = __decorate([
    RegisterAction
], MoveAClosingParentheses);
let MoveAParenthesesBlock = class MoveAParenthesesBlock extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "b"];
        this.charToMatch = "(";
        this.includeSurrounding = true;
    }
};
MoveAParenthesesBlock = __decorate([
    RegisterAction
], MoveAParenthesesBlock);
let MoveICurlyBrace = class MoveICurlyBrace extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "{"];
        this.charToMatch = "{";
    }
};
MoveICurlyBrace = __decorate([
    RegisterAction
], MoveICurlyBrace);
let MoveIClosingCurlyBrace = class MoveIClosingCurlyBrace extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "}"];
        this.charToMatch = "{";
    }
};
MoveIClosingCurlyBrace = __decorate([
    RegisterAction
], MoveIClosingCurlyBrace);
let MoveIClosingCurlyBraceBlock = class MoveIClosingCurlyBraceBlock extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "B"];
        this.charToMatch = "{";
    }
};
MoveIClosingCurlyBraceBlock = __decorate([
    RegisterAction
], MoveIClosingCurlyBraceBlock);
let MoveACurlyBrace = class MoveACurlyBrace extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "{"];
        this.charToMatch = "{";
        this.includeSurrounding = true;
    }
};
MoveACurlyBrace = __decorate([
    RegisterAction
], MoveACurlyBrace);
exports.MoveACurlyBrace = MoveACurlyBrace;
let MoveAClosingCurlyBrace = class MoveAClosingCurlyBrace extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "}"];
        this.charToMatch = "{";
        this.includeSurrounding = true;
    }
};
MoveAClosingCurlyBrace = __decorate([
    RegisterAction
], MoveAClosingCurlyBrace);
exports.MoveAClosingCurlyBrace = MoveAClosingCurlyBrace;
let MoveAClosingCurlyBraceBlock = class MoveAClosingCurlyBraceBlock extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "B"];
        this.charToMatch = "{";
        this.includeSurrounding = true;
    }
};
MoveAClosingCurlyBraceBlock = __decorate([
    RegisterAction
], MoveAClosingCurlyBraceBlock);
let MoveICaret = class MoveICaret extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "<"];
        this.charToMatch = "<";
    }
};
MoveICaret = __decorate([
    RegisterAction
], MoveICaret);
let MoveIClosingCaret = class MoveIClosingCaret extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", ">"];
        this.charToMatch = "<";
    }
};
MoveIClosingCaret = __decorate([
    RegisterAction
], MoveIClosingCaret);
let MoveACaret = class MoveACaret extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "<"];
        this.charToMatch = "<";
        this.includeSurrounding = true;
    }
};
MoveACaret = __decorate([
    RegisterAction
], MoveACaret);
exports.MoveACaret = MoveACaret;
let MoveAClosingCaret = class MoveAClosingCaret extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", ">"];
        this.charToMatch = "<";
        this.includeSurrounding = true;
    }
};
MoveAClosingCaret = __decorate([
    RegisterAction
], MoveAClosingCaret);
let MoveISquareBracket = class MoveISquareBracket extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "["];
        this.charToMatch = "[";
    }
};
MoveISquareBracket = __decorate([
    RegisterAction
], MoveISquareBracket);
let MoveIClosingSquareBraket = class MoveIClosingSquareBraket extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["i", "]"];
        this.charToMatch = "[";
    }
};
MoveIClosingSquareBraket = __decorate([
    RegisterAction
], MoveIClosingSquareBraket);
let MoveASquareBracket = class MoveASquareBracket extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "["];
        this.charToMatch = "[";
        this.includeSurrounding = true;
    }
};
MoveASquareBracket = __decorate([
    RegisterAction
], MoveASquareBracket);
exports.MoveASquareBracket = MoveASquareBracket;
let MoveAClosingSquareBracket = class MoveAClosingSquareBracket extends MoveInsideCharacter {
    constructor() {
        super(...arguments);
        this.keys = ["a", "]"];
        this.charToMatch = "[";
        this.includeSurrounding = true;
    }
};
MoveAClosingSquareBracket = __decorate([
    RegisterAction
], MoveAClosingSquareBracket);
class MoveQuoteMatch extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualBlock];
        this.includeSurrounding = false;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = textEditor_1.TextEditor.getLineAt(position).text;
            const quoteMatcher = new quoteMatcher_1.QuoteMatcher(this.charToMatch, text);
            const start = quoteMatcher.findOpening(position.character);
            const end = quoteMatcher.findClosing(start + 1);
            if (start === -1 || end === -1 || end === start || end < position.character) {
                return {
                    start: position,
                    stop: position,
                    failed: true
                };
            }
            let startPos = new position_1.Position(position.line, start);
            let endPos = new position_1.Position(position.line, end);
            if (!this.includeSurrounding) {
                startPos = startPos.getRight();
                endPos = endPos.getLeft();
            }
            if (position.isBefore(startPos)) {
                vimState.recordedState.operatorPositionDiff = startPos.subtract(position);
            }
            return {
                start: startPos,
                stop: endPos
            };
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.execAction(position, vimState);
            if (isIMovement(result)) {
                if (result.failed) {
                    vimState.recordedState.hasRunOperator = false;
                    vimState.recordedState.actionsRun = [];
                }
                else {
                    result.stop = result.stop.getRight();
                }
            }
            return result;
        });
    }
}
exports.MoveQuoteMatch = MoveQuoteMatch;
let MoveInsideSingleQuotes = class MoveInsideSingleQuotes extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["i", "'"];
        this.charToMatch = "'";
        this.includeSurrounding = false;
    }
};
MoveInsideSingleQuotes = __decorate([
    RegisterAction
], MoveInsideSingleQuotes);
let MoveASingleQuotes = class MoveASingleQuotes extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["a", "'"];
        this.charToMatch = "'";
        this.includeSurrounding = true;
    }
};
MoveASingleQuotes = __decorate([
    RegisterAction
], MoveASingleQuotes);
exports.MoveASingleQuotes = MoveASingleQuotes;
let MoveInsideDoubleQuotes = class MoveInsideDoubleQuotes extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["i", "\""];
        this.charToMatch = "\"";
        this.includeSurrounding = false;
    }
};
MoveInsideDoubleQuotes = __decorate([
    RegisterAction
], MoveInsideDoubleQuotes);
let MoveADoubleQuotes = class MoveADoubleQuotes extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["a", "\""];
        this.charToMatch = "\"";
        this.includeSurrounding = true;
    }
};
MoveADoubleQuotes = __decorate([
    RegisterAction
], MoveADoubleQuotes);
exports.MoveADoubleQuotes = MoveADoubleQuotes;
let MoveInsideBacktick = class MoveInsideBacktick extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["i", "`"];
        this.charToMatch = "`";
        this.includeSurrounding = false;
    }
};
MoveInsideBacktick = __decorate([
    RegisterAction
], MoveInsideBacktick);
let MoveABacktick = class MoveABacktick extends MoveQuoteMatch {
    constructor() {
        super(...arguments);
        this.keys = ["a", "`"];
        this.charToMatch = "`";
        this.includeSurrounding = true;
    }
};
MoveABacktick = __decorate([
    RegisterAction
], MoveABacktick);
exports.MoveABacktick = MoveABacktick;
let MoveToUnclosedRoundBracketBackward = class MoveToUnclosedRoundBracketBackward extends MoveToMatchingBracket {
    constructor() {
        super(...arguments);
        this.keys = ["[", "("];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const failure = { start: position, stop: position, failed: true };
            const charToMatch = ")";
            const result = matcher_1.PairMatcher.nextPairedChar(position.getLeftThroughLineBreaks(), charToMatch, false);
            if (!result) {
                return failure;
            }
            return result;
        });
    }
};
MoveToUnclosedRoundBracketBackward = __decorate([
    RegisterAction
], MoveToUnclosedRoundBracketBackward);
let MoveToUnclosedRoundBracketForward = class MoveToUnclosedRoundBracketForward extends MoveToMatchingBracket {
    constructor() {
        super(...arguments);
        this.keys = ["]", ")"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const failure = { start: position, stop: position, failed: true };
            const charToMatch = "(";
            const result = matcher_1.PairMatcher.nextPairedChar(position.getRightThroughLineBreaks(), charToMatch, false);
            if (!result) {
                return failure;
            }
            return result;
        });
    }
};
MoveToUnclosedRoundBracketForward = __decorate([
    RegisterAction
], MoveToUnclosedRoundBracketForward);
let MoveToUnclosedCurlyBracketBackward = class MoveToUnclosedCurlyBracketBackward extends MoveToMatchingBracket {
    constructor() {
        super(...arguments);
        this.keys = ["[", "{"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const failure = { start: position, stop: position, failed: true };
            const charToMatch = "}";
            const result = matcher_1.PairMatcher.nextPairedChar(position.getLeftThroughLineBreaks(), charToMatch, false);
            if (!result) {
                return failure;
            }
            return result;
        });
    }
};
MoveToUnclosedCurlyBracketBackward = __decorate([
    RegisterAction
], MoveToUnclosedCurlyBracketBackward);
let MoveToUnclosedCurlyBracketForward = class MoveToUnclosedCurlyBracketForward extends MoveToMatchingBracket {
    constructor() {
        super(...arguments);
        this.keys = ["]", "}"];
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const failure = { start: position, stop: position, failed: true };
            const charToMatch = "{";
            const result = matcher_1.PairMatcher.nextPairedChar(position.getRightThroughLineBreaks(), charToMatch, false);
            if (!result) {
                return failure;
            }
            return result;
        });
    }
};
MoveToUnclosedCurlyBracketForward = __decorate([
    RegisterAction
], MoveToUnclosedCurlyBracketForward);
let ToggleCaseOperator = ToggleCaseOperator_1 = class ToggleCaseOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["~"];
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const range = new vscode.Range(start, end.getRight());
            yield ToggleCaseOperator_1.toggleCase(range);
            const cursorPosition = start.isBefore(end) ? start : end;
            vimState.cursorPosition = cursorPosition;
            vimState.cursorStartPosition = cursorPosition;
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
    static toggleCase(range) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = textEditor_1.TextEditor.getText(range);
            let newText = "";
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                // Try lower-case
                let toggled = char.toLocaleLowerCase();
                if (toggled === char) {
                    // Try upper-case
                    toggled = char.toLocaleUpperCase();
                }
                newText += toggled;
            }
            yield textEditor_1.TextEditor.replace(range, newText);
        });
    }
};
ToggleCaseOperator = ToggleCaseOperator_1 = __decorate([
    RegisterAction
], ToggleCaseOperator);
let ToggleCaseVisualBlockOperator = class ToggleCaseVisualBlockOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["~"];
        this.modes = [mode_1.ModeName.VisualBlock];
    }
    run(vimState, startPos, endPos) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { start, end } of position_1.Position.IterateLine(vimState)) {
                const range = new vscode.Range(start, end);
                yield ToggleCaseOperator.toggleCase(range);
            }
            const cursorPosition = startPos.isBefore(endPos) ? startPos : endPos;
            vimState.cursorPosition = cursorPosition;
            vimState.cursorStartPosition = cursorPosition;
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
ToggleCaseVisualBlockOperator = __decorate([
    RegisterAction
], ToggleCaseVisualBlockOperator);
let ToggleCaseWithMotion = class ToggleCaseWithMotion extends ToggleCaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["g", "~"];
        this.modes = [mode_1.ModeName.Normal];
    }
};
ToggleCaseWithMotion = __decorate([
    RegisterAction
], ToggleCaseWithMotion);
let ToggleCaseAndMoveForward = class ToggleCaseAndMoveForward extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["~"];
        this.canBeRepeatedWithDot = true;
        this.runsOnceForEachCountPrefix = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new ToggleCaseOperator().run(vimState, vimState.cursorPosition, vimState.cursorPosition);
            vimState.cursorPosition = vimState.cursorPosition.getRight();
            return vimState;
        });
    }
};
ToggleCaseAndMoveForward = __decorate([
    RegisterAction
], ToggleCaseAndMoveForward);
class IncrementDecrementNumberAction extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.canBeRepeatedWithDot = true;
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = textEditor_1.TextEditor.getLineAt(position).text;
            // Start looking to the right for the next word to increment, unless we're
            // already on a word to increment, in which case start at the beginning of
            // that word.
            const whereToStart = text[position.character].match(/\s/) ? position : position.getWordLeft(true);
            for (let { start, end, word } of position_1.Position.IterateWords(whereToStart)) {
                // '-' doesn't count as a word, but is important to include in parsing
                // the number
                if (text[start.character - 1] === '-') {
                    start = start.getLeft();
                    word = text[start.character] + word;
                }
                // Strict number parsing so "1a" doesn't silently get converted to "1"
                const num = numericString_1.NumericString.parse(word);
                if (num !== null) {
                    vimState.cursorPosition = yield this.replaceNum(num, this.offset * (vimState.recordedState.count || 1), start, end);
                    vimState.cursorPosition = vimState.cursorPosition.getLeftByCount(num.suffix.length);
                    return vimState;
                }
            }
            // No usable numbers, return the original position
            return vimState;
        });
    }
    replaceNum(start, offset, startPos, endPos) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldWidth = start.toString().length;
            start.value += offset;
            const newNum = start.toString();
            const range = new vscode.Range(startPos, endPos.getRight());
            if (oldWidth === newNum.length) {
                yield textEditor_1.TextEditor.replace(range, newNum);
            }
            else {
                // Can't use replace, since new number is a different width than old
                yield textEditor_1.TextEditor.delete(range);
                yield textEditor_1.TextEditor.insertAt(newNum, startPos);
                // Adjust end position according to difference in width of number-string
                endPos = new position_1.Position(endPos.line, endPos.character + (newNum.length - oldWidth));
            }
            return endPos;
        });
    }
}
let IncrementNumberAction = class IncrementNumberAction extends IncrementDecrementNumberAction {
    constructor() {
        super(...arguments);
        this.keys = ["<C-a>"];
        this.offset = +1;
    }
};
IncrementNumberAction = __decorate([
    RegisterAction
], IncrementNumberAction);
let DecrementNumberAction = class DecrementNumberAction extends IncrementDecrementNumberAction {
    constructor() {
        super(...arguments);
        this.keys = ["<C-x>"];
        this.offset = -1;
    }
};
DecrementNumberAction = __decorate([
    RegisterAction
], DecrementNumberAction);
class MoveTagMatch extends BaseMovement {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualBlock];
        this.includeTag = false;
    }
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const editorText = textEditor_1.TextEditor.getText();
            const offset = textEditor_1.TextEditor.getOffsetAt(position);
            const tagMatcher = new tagMatcher_1.TagMatcher(editorText, offset);
            const start = tagMatcher.findOpening(this.includeTag);
            const end = tagMatcher.findClosing(this.includeTag);
            if (start === undefined || end === undefined) {
                return {
                    start: position,
                    stop: position,
                    failed: true
                };
            }
            let startPosition = start ? textEditor_1.TextEditor.getPositionAt(start) : position;
            let endPosition = end ? textEditor_1.TextEditor.getPositionAt(end) : position;
            if (position.isAfter(endPosition)) {
                vimState.recordedState.transformations.push({ type: "moveCursor",
                    diff: endPosition.subtract(position) });
            }
            else if (position.isBefore(startPosition)) {
                vimState.recordedState.transformations.push({ type: "moveCursor",
                    diff: startPosition.subtract(position) });
            }
            if (start === end) {
                if (vimState.recordedState.operator instanceof ChangeOperator) {
                    vimState.currentMode = mode_1.ModeName.Insert;
                }
                return {
                    start: startPosition,
                    stop: startPosition,
                    failed: true
                };
            }
            return {
                start: startPosition,
                stop: endPosition.getLeftThroughLineBreaks(true)
            };
        });
    }
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.execAction(position, vimState);
            if (isIMovement(result)) {
                if (result.failed) {
                    vimState.recordedState.hasRunOperator = false;
                    vimState.recordedState.actionsRun = [];
                }
                else {
                    result.stop = result.stop.getRight();
                }
            }
            return result;
        });
    }
}
let MoveInsideTag = class MoveInsideTag extends MoveTagMatch {
    constructor() {
        super(...arguments);
        this.keys = ["i", "t"];
        this.includeTag = false;
    }
};
MoveInsideTag = __decorate([
    RegisterAction
], MoveInsideTag);
exports.MoveInsideTag = MoveInsideTag;
let MoveAroundTag = class MoveAroundTag extends MoveTagMatch {
    constructor() {
        super(...arguments);
        this.keys = ["a", "t"];
        this.includeTag = true;
    }
};
MoveAroundTag = __decorate([
    RegisterAction
], MoveAroundTag);
exports.MoveAroundTag = MoveAroundTag;
let ActionTriggerHover = class ActionTriggerHover extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["g", "h"];
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("editor.action.showHover");
            return vimState;
        });
    }
};
ActionTriggerHover = __decorate([
    RegisterAction
], ActionTriggerHover);
/**
 * Multi-Cursor Command Overrides
 *
 * We currently have to override the vscode key commands that get us into multi-cursor mode.
 *
 * Normally, we'd just listen for another cursor to be added in order to go into multi-cursor
 * mode rather than rewriting each keybinding one-by-one. We can't currently do that because
 * Visual Block Mode also creates additional cursors, but will get confused if you're in
 * multi-cursor mode.
 */
let ActionOverrideCmdD = class ActionOverrideCmdD extends BaseCommand {
    /**
     * Multi-Cursor Command Overrides
     *
     * We currently have to override the vscode key commands that get us into multi-cursor mode.
     *
     * Normally, we'd just listen for another cursor to be added in order to go into multi-cursor
     * mode rather than rewriting each keybinding one-by-one. We can't currently do that because
     * Visual Block Mode also creates additional cursors, but will get confused if you're in
     * multi-cursor mode.
     */
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = [
            ["<D-d>"],
            ["g", "c"]
        ];
        this.runsOnceForEachCountPrefix = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('editor.action.addSelectionToNextFindMatch');
            vimState.allCursors = yield util_1.allowVSCodeToPropagateCursorUpdatesAndReturnThem();
            // If this is the first cursor, select 1 character less
            // so that only the word is selected, no extra character
            if (vimState.allCursors.length === 1) {
                vimState.allCursors[0] = vimState.allCursors[0].withNewStop(vimState.allCursors[0].stop.getLeft());
            }
            vimState.currentMode = mode_1.ModeName.Visual;
            return vimState;
        });
    }
};
ActionOverrideCmdD = __decorate([
    RegisterAction
], ActionOverrideCmdD);
let ActionOverrideCmdAltDown = class ActionOverrideCmdAltDown extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = [
            ["<D-alt+down>"],
            ["<C-alt+down>"],
        ];
        this.runsOnceForEachCountPrefix = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('editor.action.insertCursorBelow');
            vimState.allCursors = yield util_1.allowVSCodeToPropagateCursorUpdatesAndReturnThem();
            return vimState;
        });
    }
};
ActionOverrideCmdAltDown = __decorate([
    RegisterAction
], ActionOverrideCmdAltDown);
let ActionOverrideCmdAltUp = class ActionOverrideCmdAltUp extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual];
        this.keys = [
            ["<D-alt+up>"],
            ["<C-alt+up>"],
        ];
        this.runsOnceForEachCountPrefix = true;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('editor.action.insertCursorAbove');
            vimState.allCursors = yield util_1.allowVSCodeToPropagateCursorUpdatesAndReturnThem();
            return vimState;
        });
    }
};
ActionOverrideCmdAltUp = __decorate([
    RegisterAction
], ActionOverrideCmdAltUp);
class BaseEasyMotionCommand extends BaseCommand {
    getMatches(position, vimState) {
        throw new Error("Not implemented!");
    }
    getMatchPosition(match, position, vimState) {
        return match.position;
    }
    processMarkers(matches, position, vimState) {
        // Clear existing markers, just in case
        vimState.easyMotion.clearMarkers();
        var index = 0;
        for (var j = 0; j < matches.length; j++) {
            var match = matches[j];
            var pos = this.getMatchPosition(match, position, vimState);
            if (match.position.isEqual(position)) {
                continue;
            }
            let marker = easymotion_1.EasyMotion.generateMarker(index++, matches.length, position, pos);
            if (marker) {
                vimState.easyMotion.addMarker(marker);
            }
        }
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only execute the action if the configuration is set
            if (!configuration_1.Configuration.easymotion) {
                return vimState;
            }
            // Search all occurences of the character pressed
            let matches = this.getMatches(position, vimState);
            // Stop if there are no matches
            if (matches.length === 0) {
                return vimState;
            }
            // Enter the EasyMotion mode and await further keys
            vimState.easyMotion = new easymotion_1.EasyMotion();
            // Store mode to return to after performing easy motion
            vimState.easyMotion.previousMode = vimState.currentMode;
            vimState.currentMode = mode_1.ModeName.EasyMotionMode;
            this.processMarkers(matches, position, vimState);
            return vimState;
        });
    }
}
let ActionEasyMotionSearchCommand = class ActionEasyMotionSearchCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "s", "<character>"];
    }
    getMatches(position, vimState) {
        const searchChar = this.keysPressed[3];
        // Search all occurences of the character pressed
        if (searchChar === " ") {
            return vimState.easyMotion.sortedSearch(position, new RegExp(" {1,}", "g"));
        }
        else {
            return vimState.easyMotion.sortedSearch(position, searchChar);
        }
    }
};
ActionEasyMotionSearchCommand = __decorate([
    RegisterAction
], ActionEasyMotionSearchCommand);
let ActionEasyMotionFindForwardCommand = class ActionEasyMotionFindForwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "f", "<character>"];
    }
    getMatches(position, vimState) {
        const searchChar = this.keysPressed[3];
        // Search all occurences of the character pressed after the cursor
        if (searchChar === " ") {
            return vimState.easyMotion.sortedSearch(position, new RegExp(" {1,}", "g"), {
                min: position
            });
        }
        else {
            return vimState.easyMotion.sortedSearch(position, searchChar, {
                min: position
            });
        }
    }
};
ActionEasyMotionFindForwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionFindForwardCommand);
let ActionEasyMotionFindBackwardCommand = class ActionEasyMotionFindBackwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "F", "<character>"];
    }
    getMatches(position, vimState) {
        const searchChar = this.keysPressed[3];
        // Search all occurences of the character pressed after the cursor
        if (searchChar === " ") {
            return vimState.easyMotion.sortedSearch(position, new RegExp(" {1,}", "g"), {
                max: position
            });
        }
        else {
            return vimState.easyMotion.sortedSearch(position, searchChar, {
                max: position
            });
        }
    }
};
ActionEasyMotionFindBackwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionFindBackwardCommand);
let ActionEasyMotionTilForwardCommand = class ActionEasyMotionTilForwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "t", "<character>"];
    }
    getMatches(position, vimState) {
        const searchChar = this.keysPressed[3];
        // Search all occurences of the character pressed after the cursor
        if (searchChar === " ") {
            return vimState.easyMotion.sortedSearch(position, new RegExp(" {1,}", "g"), {
                min: position
            });
        }
        else {
            return vimState.easyMotion.sortedSearch(position, searchChar, {
                min: position
            });
        }
    }
    getMatchPosition(match, position, vimState) {
        return new position_1.Position(match.position.line, Math.max(0, match.position.character - 1));
    }
};
ActionEasyMotionTilForwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionTilForwardCommand);
let ActionEasyMotionTilBackwardCommand = class ActionEasyMotionTilBackwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "T", "<character>"];
    }
    getMatches(position, vimState) {
        const searchChar = this.keysPressed[3];
        // Search all occurences of the character pressed after the cursor
        if (searchChar === " ") {
            return vimState.easyMotion.sortedSearch(position, new RegExp(" {1,}"), {
                max: position
            });
        }
        else {
            return vimState.easyMotion.sortedSearch(position, searchChar, {
                max: position
            });
        }
    }
    getMatchPosition(match, position, vimState) {
        return new position_1.Position(match.position.line, Math.max(0, match.position.character + 1));
    }
};
ActionEasyMotionTilBackwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionTilBackwardCommand);
let ActionEasyMotionWordCommand = class ActionEasyMotionWordCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "w"];
    }
    getMatches(position, vimState) {
        // Search for the beginning of all words after the cursor
        return vimState.easyMotion.sortedSearch(position, new RegExp("\\w{1,}", "g"), {
            min: position
        });
    }
};
ActionEasyMotionWordCommand = __decorate([
    RegisterAction
], ActionEasyMotionWordCommand);
let ActionEasyMotionEndForwardCommand = class ActionEasyMotionEndForwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "e"];
    }
    getMatches(position, vimState) {
        // Search for the end of all words after the cursor
        return vimState.easyMotion.sortedSearch(position, new RegExp("\\w{1,}", "g"), {
            min: position
        });
    }
    getMatchPosition(match, position, vimState) {
        return new position_1.Position(match.position.line, match.position.character + match.text.length - 1);
    }
};
ActionEasyMotionEndForwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionEndForwardCommand);
let ActionEasyMotionEndBackwardCommand = class ActionEasyMotionEndBackwardCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "g", "e"];
    }
    getMatches(position, vimState) {
        // Search for the beginning of all words before the cursor
        return vimState.easyMotion.sortedSearch(position, new RegExp("\\w{1,}", "g"), {
            max: position,
        });
    }
    getMatchPosition(match, position, vimState) {
        return new position_1.Position(match.position.line, match.position.character + match.text.length - 1);
    }
};
ActionEasyMotionEndBackwardCommand = __decorate([
    RegisterAction
], ActionEasyMotionEndBackwardCommand);
let ActionEasyMotionBeginningWordCommand = class ActionEasyMotionBeginningWordCommand extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "b"];
    }
    getMatches(position, vimState) {
        // Search for the beginning of all words before the cursor
        return vimState.easyMotion.sortedSearch(position, new RegExp("\\w{1,}", "g"), {
            max: position,
        });
    }
};
ActionEasyMotionBeginningWordCommand = __decorate([
    RegisterAction
], ActionEasyMotionBeginningWordCommand);
let ActionEasyMotionDownLines = class ActionEasyMotionDownLines extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "j"];
    }
    getMatches(position, vimState) {
        // Search for the beginning of all non whitespace chars on each line after the cursor
        let matches = vimState.easyMotion.sortedSearch(position, new RegExp("^.", "gm"), {
            min: position
        });
        for (let match of matches) {
            match.position = match.position.getFirstLineNonBlankChar();
        }
        return matches;
    }
};
ActionEasyMotionDownLines = __decorate([
    RegisterAction
], ActionEasyMotionDownLines);
let ActionEasyMotionUpLines = class ActionEasyMotionUpLines extends BaseEasyMotionCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.keys = ["<leader>", "<leader>", "k"];
    }
    getMatches(position, vimState) {
        // Search for the beginning of all non whitespace chars on each line before the cursor
        let matches = vimState.easyMotion.sortedSearch(position, new RegExp("^.", "gm"), {
            max: position
        });
        for (let match of matches) {
            match.position = match.position.getFirstLineNonBlankChar();
        }
        return matches;
    }
};
ActionEasyMotionUpLines = __decorate([
    RegisterAction
], ActionEasyMotionUpLines);
let MoveEasyMotion = class MoveEasyMotion extends BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.EasyMotionMode];
        this.keys = ["<character>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            var key = this.keysPressed[0];
            if (!key) {
                return vimState;
            }
            // "nail" refers to the accumulated depth keys
            var nail = vimState.easyMotion.accumulation + key;
            vimState.easyMotion.accumulation = nail;
            // Find markers starting with "nail"
            var markers = vimState.easyMotion.findMarkers(nail);
            // If previous mode was visual, restore visual selection
            if (vimState.easyMotion.previousMode === mode_1.ModeName.Visual ||
                vimState.easyMotion.previousMode === mode_1.ModeName.VisualLine ||
                vimState.easyMotion.previousMode === mode_1.ModeName.VisualBlock) {
                vimState.cursorStartPosition = vimState.lastVisualSelectionStart;
                vimState.cursorPosition = vimState.lastVisualSelectionEnd;
            }
            if (markers.length === 1) {
                var marker = markers[0];
                vimState.easyMotion.clearDecorations();
                // Restore the mode from before easy motion
                vimState.currentMode = vimState.easyMotion.previousMode;
                // Set cursor position based on marker entered
                vimState.cursorPosition = marker.position;
                return vimState;
            }
            else {
                if (markers.length === 0) {
                    vimState.easyMotion.clearDecorations();
                    vimState.currentMode = vimState.easyMotion.previousMode;
                    return vimState;
                }
            }
            return vimState;
        });
    }
};
MoveEasyMotion = __decorate([
    RegisterAction
], MoveEasyMotion);
let CommentOperator = class CommentOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["g", "b"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            vimState.editor.selection = new vscode.Selection(start.getLineBegin(), end.getLineEnd());
            yield vscode.commands.executeCommand("editor.action.commentLine");
            vimState.cursorPosition = new position_1.Position(start.line, 0);
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommentOperator = __decorate([
    RegisterAction
], CommentOperator);
exports.CommentOperator = CommentOperator;
let CommentBlockOperator = class CommentBlockOperator extends BaseOperator {
    constructor() {
        super(...arguments);
        this.keys = ["g", "B"];
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
    }
    run(vimState, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const endPosition = vimState.currentMode === mode_1.ModeName.Normal ? end.getRight() : end;
            vimState.editor.selection = new vscode.Selection(start, endPosition);
            yield vscode.commands.executeCommand("editor.action.blockComment");
            vimState.cursorPosition = start;
            vimState.currentMode = mode_1.ModeName.Normal;
            return vimState;
        });
    }
};
CommentBlockOperator = __decorate([
    RegisterAction
], CommentBlockOperator);
exports.CommentBlockOperator = CommentBlockOperator;
var PutCommand_1, MoveRepeatReversed_1, ActionVisualReflowParagraph_1, MoveToMatchingBracket_1, ToggleCaseOperator_1;
//# sourceMappingURL=actions.js.map