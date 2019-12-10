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
const mode_1 = require("./../mode/mode");
const range_1 = require("./../motion/range");
const textEditor_1 = require("./../textEditor");
const matcher_1 = require("./../matching/matcher");
const configuration_1 = require("./../configuration/configuration");
const actions_1 = require("./actions");
const textobject_1 = require("./textobject");
let CommandSurroundAddToReplacement = CommandSurroundAddToReplacement_1 = class CommandSurroundAddToReplacement extends actions_1.BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SurroundInputMode];
        this.keys = ["<any>"];
    }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vimState.surround) {
                return vimState;
            }
            // Backspace modifies the tag entry
            if (vimState.surround.replacement !== undefined) {
                if (this.keysPressed[this.keysPressed.length - 1] === "<BS>" &&
                    vimState.surround.replacement[0] === "<") {
                    // Only allow backspace up until the < character
                    if (vimState.surround.replacement.length > 1) {
                        vimState.surround.replacement =
                            vimState.surround.replacement.slice(0, vimState.surround.replacement.length - 1);
                    }
                    return vimState;
                }
            }
            if (!vimState.surround.replacement) {
                vimState.surround.replacement = "";
            }
            let stringToAdd = this.keysPressed[this.keysPressed.length - 1];
            // t should start creation of a tag
            if (this.keysPressed[0] === "t" && vimState.surround.replacement.length === 0) {
                stringToAdd = "<";
            }
            // Convert a few shortcuts to the correct surround characters when NOT entering a tag
            if (vimState.surround.replacement.length === 0) {
                if (stringToAdd === "b") {
                    stringToAdd = "(";
                }
                if (stringToAdd === "B") {
                    stringToAdd = "{";
                }
                if (stringToAdd === "r") {
                    stringToAdd = "[";
                }
            }
            vimState.surround.replacement += stringToAdd;
            yield CommandSurroundAddToReplacement_1.TryToExecuteSurround(vimState, position);
            return vimState;
        });
    }
    static Finish(vimState) {
        vimState.recordedState.hasRunOperator = false;
        vimState.recordedState.actionsRun = [];
        vimState.recordedState.hasRunSurround = true;
        vimState.surround = undefined;
        vimState.currentMode = mode_1.ModeName.Normal;
        // Record keys that were pressed since surround started
        for (let i = vimState.recordedState.surroundKeyIndexStart; i < vimState.keyHistory.length; i++) {
            vimState.recordedState.surroundKeys.push(vimState.keyHistory[i]);
        }
        return false;
    }
    // we assume that we start directly on the characters we're operating over
    // e.g. cs{' starts us with start on { end on }.
    static RemoveWhitespace(vimState, start, stop) {
        const firstRangeStart = start.getRightThroughLineBreaks();
        let firstRangeEnd = start.getRightThroughLineBreaks();
        let secondRangeStart = stop.getLeftThroughLineBreaks();
        const secondRangeEnd = stop.getLeftThroughLineBreaks().getRight();
        if (firstRangeEnd.isEqual(secondRangeStart)) {
            return;
        }
        while (!firstRangeEnd.isEqual(stop) &&
            textEditor_1.TextEditor.getCharAt(firstRangeEnd).match(/[ \t]/) &&
            !firstRangeEnd.isLineEnd()) {
            firstRangeEnd = firstRangeEnd.getRight();
        }
        while (!secondRangeStart.isEqual(firstRangeEnd) &&
            textEditor_1.TextEditor.getCharAt(secondRangeStart).match(/[ \t]/) &&
            !secondRangeStart.isLineBeginning()) {
            secondRangeStart = secondRangeStart.getLeftThroughLineBreaks(false);
        }
        // Adjust range start based on found position
        secondRangeStart = secondRangeStart.getRight();
        const firstRange = new range_1.Range(firstRangeStart, firstRangeEnd);
        const secondRange = new range_1.Range(secondRangeStart, secondRangeEnd);
        vimState.recordedState.transformations.push({ type: "deleteRange", range: firstRange });
        vimState.recordedState.transformations.push({ type: "deleteRange", range: secondRange });
    }
    static GetStartAndEndReplacements(replacement) {
        if (!replacement) {
            return { startReplace: "", endReplace: "" };
        }
        let startReplace = replacement;
        let endReplace = replacement;
        if (startReplace[0] === "<") {
            endReplace = startReplace[0] + "/" + startReplace.slice(1);
        }
        if (startReplace.length === 1 && startReplace in matcher_1.PairMatcher.pairings) {
            endReplace = matcher_1.PairMatcher.pairings[startReplace].match;
            if (!matcher_1.PairMatcher.pairings[startReplace].nextMatchIsForward) {
                [startReplace, endReplace] = [endReplace, startReplace];
            }
            else {
                startReplace = startReplace + " ";
                endReplace = " " + endReplace;
            }
        }
        return { startReplace, endReplace };
    }
    // Returns true if it could actually find something to run surround on.
    static TryToExecuteSurround(vimState, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const { target, replacement, operator } = vimState.surround;
            if (operator === "change" || operator === "yank") {
                if (!replacement) {
                    return false;
                }
                // This is an incomplete tag. Wait for the user to finish it.
                if (replacement[0] === "<" && replacement[replacement.length - 1] !== ">") {
                    return false;
                }
            }
            let { startReplace, endReplace } = this.GetStartAndEndReplacements(replacement);
            if (operator === "yank") {
                if (!vimState.surround) {
                    return false;
                }
                if (!vimState.surround.range) {
                    return false;
                }
                let start = vimState.surround.range.start;
                let stop = vimState.surround.range.stop;
                stop = stop.getRight();
                if (vimState.surround.isVisualLine) {
                    startReplace = startReplace + "\n";
                    endReplace = "\n" + endReplace;
                }
                vimState.recordedState.transformations.push({ type: "insertText", text: startReplace, position: start });
                vimState.recordedState.transformations.push({ type: "insertText", text: endReplace, position: stop });
                return CommandSurroundAddToReplacement_1.Finish(vimState);
            }
            let startReplaceRange;
            let endReplaceRange;
            let startDeleteRange;
            let endDeleteRange;
            const quoteMatches = [
                { char: "'", movement: () => new actions_1.MoveASingleQuotes() },
                { char: '"', movement: () => new actions_1.MoveADoubleQuotes() },
                { char: "`", movement: () => new actions_1.MoveABacktick() },
            ];
            for (const { char, movement } of quoteMatches) {
                if (char !== target) {
                    continue;
                }
                const { start, stop, failed } = yield movement().execAction(position, vimState);
                if (failed) {
                    return CommandSurroundAddToReplacement_1.Finish(vimState);
                }
                startReplaceRange = new range_1.Range(start, start.getRight());
                endReplaceRange = new range_1.Range(stop, stop.getRight());
            }
            const pairedMatchings = [
                { open: "{", close: "}", movement: () => new actions_1.MoveACurlyBrace() },
                { open: "[", close: "]", movement: () => new actions_1.MoveASquareBracket() },
                { open: "(", close: ")", movement: () => new actions_1.MoveAParentheses() },
                { open: "<", close: ">", movement: () => new actions_1.MoveACaret() },
            ];
            for (const { open, close, movement } of pairedMatchings) {
                if (target !== open && target !== close) {
                    continue;
                }
                let { start, stop, failed } = yield movement().execAction(position, vimState);
                if (failed) {
                    return CommandSurroundAddToReplacement_1.Finish(vimState);
                }
                stop = stop.getLeft();
                startReplaceRange = new range_1.Range(start, start.getRight());
                endReplaceRange = new range_1.Range(stop, stop.getRight());
                if (target === open) {
                    CommandSurroundAddToReplacement_1.RemoveWhitespace(vimState, start, stop);
                }
            }
            if (target === "t") {
                let { start, stop, failed } = yield new actions_1.MoveAroundTag().execAction(position, vimState);
                let tagEnd = yield new actions_1.MoveInsideTag().execAction(position, vimState);
                if (failed || tagEnd.failed) {
                    return CommandSurroundAddToReplacement_1.Finish(vimState);
                }
                stop = stop.getRight();
                tagEnd.stop = tagEnd.stop.getRight();
                if (failed) {
                    return CommandSurroundAddToReplacement_1.Finish(vimState);
                }
                startReplaceRange = new range_1.Range(start, start.getRight());
                endReplaceRange = new range_1.Range(tagEnd.stop, tagEnd.stop.getRight());
                startDeleteRange = new range_1.Range(start.getRight(), tagEnd.start);
                endDeleteRange = new range_1.Range(tagEnd.stop.getRight(), stop);
            }
            if (operator === "change") {
                if (!replacement) {
                    return false;
                }
                const wordMatchings = [
                    { char: "w", movement: () => new textobject_1.SelectInnerWord(), addNewline: "no" },
                    { char: "p", movement: () => new textobject_1.SelectInnerParagraph(), addNewline: "both" },
                    { char: "s", movement: () => new textobject_1.SelectInnerSentence(), addNewline: "end-only" },
                    { char: "W", movement: () => new textobject_1.SelectInnerBigWord(), addNewline: "no" },
                ];
                for (const { char, movement, addNewline } of wordMatchings) {
                    if (target !== char) {
                        continue;
                    }
                    let { stop, start, failed } = yield movement().execAction(position, vimState);
                    stop = stop.getRight();
                    if (failed) {
                        return CommandSurroundAddToReplacement_1.Finish(vimState);
                    }
                    if (addNewline === "end-only" || addNewline === "both") {
                        endReplace = "\n" + endReplace;
                    }
                    if (addNewline === "both") {
                        startReplace += "\n";
                    }
                    vimState.recordedState.transformations.push({ type: "insertText", text: startReplace, position: start });
                    vimState.recordedState.transformations.push({ type: "insertText", text: endReplace, position: stop });
                    return CommandSurroundAddToReplacement_1.Finish(vimState);
                }
            }
            // We've got our ranges. Run the surround command with the appropriate operator.
            if (!startReplaceRange && !endReplaceRange && !startDeleteRange && !endDeleteRange) {
                return false;
            }
            if (operator === "change") {
                if (!replacement) {
                    return false;
                }
                if (startReplaceRange) {
                    textEditor_1.TextEditor.replaceText(vimState, startReplace, startReplaceRange.start, startReplaceRange.stop);
                }
                if (endReplaceRange) {
                    textEditor_1.TextEditor.replaceText(vimState, endReplace, endReplaceRange.start, endReplaceRange.stop);
                }
                if (startDeleteRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: startDeleteRange });
                }
                if (endDeleteRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: endDeleteRange });
                }
                return CommandSurroundAddToReplacement_1.Finish(vimState);
            }
            if (operator === "delete") {
                if (startReplaceRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: startReplaceRange });
                }
                if (endReplaceRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: endReplaceRange });
                }
                if (startDeleteRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: startDeleteRange });
                }
                if (endDeleteRange) {
                    vimState.recordedState.transformations.push({ type: "deleteRange", range: endDeleteRange });
                }
                return CommandSurroundAddToReplacement_1.Finish(vimState);
            }
            return false;
        });
    }
};
CommandSurroundAddToReplacement = CommandSurroundAddToReplacement_1 = __decorate([
    actions_1.RegisterAction
], CommandSurroundAddToReplacement);
exports.CommandSurroundAddToReplacement = CommandSurroundAddToReplacement;
let CommandSurroundAddTarget = class CommandSurroundAddTarget extends actions_1.BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.SurroundInputMode];
        this.keys = [
            ["("], [")"],
            ["{"], ["}"],
            ["["], ["]"],
            ["<"], [">"],
            ["'"], ['"'], ["`"],
            ["t"],
            ["w"], ["W"], ["s"],
            ["p"]
        ];
        this.isCompleteAction = false;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vimState.surround) {
                return vimState;
            }
            vimState.surround.target = this.keysPressed[this.keysPressed.length - 1];
            // It's possible we're already done, e.g. dst
            yield CommandSurroundAddToReplacement.TryToExecuteSurround(vimState, position);
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) &&
            !!(vimState.surround && vimState.surround.active &&
                !vimState.surround.target &&
                !vimState.surround.range);
    }
    couldActionApply(vimState, keysPressed) {
        return super.doesActionApply(vimState, keysPressed) &&
            !!(vimState.surround && vimState.surround.active &&
                !vimState.surround.target &&
                !vimState.surround.range);
    }
};
CommandSurroundAddTarget = __decorate([
    actions_1.RegisterAction
], CommandSurroundAddTarget);
let CommandSurroundModeStart = class CommandSurroundModeStart extends actions_1.BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Normal];
        this.keys = ["s"];
        this.isCompleteAction = false;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only execute the action if the configuration is set
            if (!configuration_1.Configuration.surround) {
                return vimState;
            }
            const operator = vimState.recordedState.operator;
            let operatorString;
            if (operator instanceof actions_1.ChangeOperator) {
                operatorString = "change";
            }
            if (operator instanceof actions_1.DeleteOperator) {
                operatorString = "delete";
            }
            if (operator instanceof actions_1.YankOperator) {
                operatorString = "yank";
            }
            if (!operatorString) {
                return vimState;
            }
            // Start to record the keys to store for playback of surround using dot
            vimState.recordedState.surroundKeys.push(vimState.keyHistory[vimState.keyHistory.length - 2]);
            vimState.recordedState.surroundKeys.push("s");
            vimState.recordedState.surroundKeyIndexStart = vimState.keyHistory.length;
            vimState.surround = {
                active: true,
                target: undefined,
                operator: operatorString,
                replacement: undefined,
                range: undefined,
                isVisualLine: false
            };
            if (operatorString !== "yank") {
                vimState.currentMode = mode_1.ModeName.SurroundInputMode;
            }
            return vimState;
        });
    }
    doesActionApply(vimState, keysPressed) {
        const hasSomeOperator = !!vimState.recordedState.operator;
        return super.doesActionApply(vimState, keysPressed) &&
            hasSomeOperator;
    }
    couldActionApply(vimState, keysPressed) {
        const hasSomeOperator = !!vimState.recordedState.operator;
        return super.doesActionApply(vimState, keysPressed) &&
            hasSomeOperator;
    }
};
CommandSurroundModeStart = __decorate([
    actions_1.RegisterAction
], CommandSurroundModeStart);
let CommandSurroundModeStartVisual = class CommandSurroundModeStartVisual extends actions_1.BaseCommand {
    constructor() {
        super(...arguments);
        this.modes = [mode_1.ModeName.Visual, mode_1.ModeName.VisualLine];
        this.keys = ["S"];
        this.isCompleteAction = false;
    }
    runsOnceForEveryCursor() { return false; }
    exec(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only execute the action if the configuration is set
            if (!configuration_1.Configuration.surround) {
                return vimState;
            }
            // Start to record the keys to store for playback of surround using dot
            vimState.recordedState.surroundKeys.push("S");
            vimState.recordedState.surroundKeyIndexStart = vimState.keyHistory.length;
            // Make sure cursor positions are ordered correctly for top->down or down->top selection
            if (vimState.cursorStartPosition.line > vimState.cursorPosition.line) {
                [vimState.cursorPosition, vimState.cursorStartPosition] =
                    [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            // Make sure start/end cursor positions are in order
            if (vimState.cursorPosition.line < vimState.cursorPosition.line ||
                (vimState.cursorPosition.line === vimState.cursorStartPosition.line
                    && vimState.cursorPosition.character < vimState.cursorStartPosition.character)) {
                [vimState.cursorPosition, vimState.cursorStartPosition] = [vimState.cursorStartPosition, vimState.cursorPosition];
            }
            vimState.surround = {
                active: true,
                target: undefined,
                operator: "yank",
                replacement: undefined,
                range: new range_1.Range(vimState.cursorStartPosition, vimState.cursorPosition),
                isVisualLine: false
            };
            if (vimState.currentMode === mode_1.ModeName.VisualLine) {
                vimState.surround.isVisualLine = true;
            }
            vimState.currentMode = mode_1.ModeName.SurroundInputMode;
            vimState.cursorPosition = vimState.cursorStartPosition;
            return vimState;
        });
    }
};
CommandSurroundModeStartVisual = __decorate([
    actions_1.RegisterAction
], CommandSurroundModeStartVisual);
var CommandSurroundAddToReplacement_1;
//# sourceMappingURL=surround.js.map