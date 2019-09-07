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
/**
 * HistoryTracker is a handrolled undo/redo tracker for VSC. We currently
 * track history as a list of "steps", each of which consists of 1 or more
 * "changes".
 *
 * A Change is something like adding or deleting a few letters.
 *
 * A Step is multiple Changes.
 *
 * Undo/Redo will advance forward or backwards through Steps.
 */
const DiffMatchPatch = require("diff-match-patch");
const _ = require("lodash");
const vscode = require("vscode");
const position_1 = require("./../common/motion/position");
const logger_1 = require("./../util/logger");
const textEditor_1 = require("./../textEditor");
const diffEngine = new DiffMatchPatch.diff_match_patch();
diffEngine.Diff_Timeout = 1; // 1 second
class DocumentChange {
    constructor(start, text, isAdd) {
        this.start = start;
        this.text = text;
        this.isAdd = isAdd;
    }
    /**
     * Run this change.
     */
    do(undo = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((this.isAdd && !undo) || (!this.isAdd && undo)) {
                yield textEditor_1.TextEditor.insert(this.text, this.start, false);
            }
            else {
                yield textEditor_1.TextEditor.delete(new vscode.Range(this.start, this.end()));
            }
        });
    }
    /**
     * Run this change in reverse.
     */
    undo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.do(true);
        });
    }
    /**
     * the position after advancing start by text
     */
    end() {
        return this.start.advancePositionByText(this.text);
    }
}
class HistoryStep {
    constructor(init) {
        /**
         * The position of every mark at the start of this history step.
         */
        this.marks = [];
        // This is a bug, but fixing it causes regressions. See PR #2081.
        this.changes = init.changes = [];
        this.isFinished = init.isFinished || false;
        this.cursorStart = init.cursorStart || undefined;
        this.cursorEnd = init.cursorEnd || undefined;
        this.marks = init.marks || [];
    }
    /**
     * merge collapses individual character changes into larger blocks of changes
     */
    merge() {
        if (this.changes.length < 2) {
            return;
        }
        // merged will replace this.changes
        const merged = [];
        // manually reduce() this.changes with variables `current` and `next`
        // we can't use reduce() directly because the loop can emit multiple elements
        let current = this.changes[0];
        for (const next of this.changes.slice(1)) {
            if (current.text.length === 0) {
                // current is eliminated, replace it with top of merged, or adopt next as current
                // see also add+del case
                if (merged.length > 0) {
                    current = merged.pop();
                }
                else {
                    current = next;
                    continue;
                }
            }
            // merge logic. also compares start & end() Positions to ensure this is the same location
            if (current.isAdd && next.isAdd && current.end().isEqual(next.start)) {
                // merge add+add together
                current.text += next.text;
            }
            else if (!current.isAdd && !next.isAdd && next.end().isEqual(current.start)) {
                // merge del+del together, but in reverse so it still reads forward
                next.text += current.text;
                current = next;
            }
            else if (current.isAdd && !next.isAdd && current.end().isEqual(next.end())) {
                // collapse add+del into add. this might make current.text.length === 0, see beginning of loop
                current.text = current.text.slice(0, -next.text.length);
            }
            else {
                // del+add must be two separate DocumentChanges. e.g. start with "a|b", do `i<BS>x<Esc>` you end up with "|xb"
                // also handles multiple changes in distant locations in the document
                merged.push(current);
                current = next;
            }
        }
        merged.push(current);
        this.changes = merged;
    }
}
class HistoryTracker {
    constructor(vimState) {
        this._logger = logger_1.Logger.get('DocumentChange');
        // Current index in changelist for navigation, resets when a new change is made
        this.changelistIndex = 0;
        /**
         * The entire Undo/Redo stack.
         */
        this.historySteps = [];
        /**
         * Our index in the Undo/Redo stack.
         */
        this.currentHistoryStepIndex = 0;
        this.vimState = vimState;
        this._initialize();
    }
    get currentHistoryStep() {
        if (this.currentHistoryStepIndex === -1) {
            const msg = 'Tried to modify history at index -1';
            this._logger.warn(msg);
            throw new Error('HistoryTracker:' + msg);
        }
        return this.historySteps[this.currentHistoryStepIndex];
    }
    clear() {
        this.historySteps = [];
        this.currentHistoryStepIndex = 0;
        this._initialize();
    }
    /**
     * We add an initial, unrevertable step, which inserts the entire document.
     */
    _initialize() {
        this.historySteps.push(new HistoryStep({
            changes: [new DocumentChange(new position_1.Position(0, 0), this._getDocumentText(), true)],
            isFinished: true,
            cursorStart: [new position_1.Position(0, 0)],
            cursorEnd: [new position_1.Position(0, 0)],
        }));
        this.finishCurrentStep();
        this.oldText = this._getDocumentText();
        this.currentContentChanges = [];
        this.lastContentChanges = [];
    }
    _getDocumentText() {
        return ((this.vimState.editor &&
            this.vimState.editor.document &&
            this.vimState.editor.document.getText()) ||
            '');
    }
    _addNewHistoryStep() {
        this.historySteps.push(new HistoryStep({
            marks: this.currentHistoryStep.marks,
        }));
        this.currentHistoryStepIndex++;
    }
    /**
     * Marks refer to relative locations in the document, rather than absolute ones.
     *
     * This big gnarly method updates our marks such that they continue to mark
     * the same character when the user does a document edit that would move the
     * text that was marked.
     */
    updateAndReturnMarks() {
        const previousMarks = this.currentHistoryStep.marks;
        let newMarks = [];
        // clone old marks into new marks
        for (const mark of previousMarks) {
            newMarks.push({
                name: mark.name,
                position: mark.position,
                isUppercaseMark: mark.isUppercaseMark,
            });
        }
        for (const change of this.currentHistoryStep.changes) {
            for (const newMark of newMarks) {
                // Run through each character added/deleted, and see if it could have
                // affected the position of this mark.
                let pos = change.start;
                if (change.isAdd) {
                    // (Yes, I could merge these together, but that would obfusciate the logic.)
                    for (const ch of change.text) {
                        // Update mark
                        if (pos.compareTo(newMark.position) <= 0) {
                            if (ch === '\n') {
                                newMark.position = new position_1.Position(newMark.position.line + 1, newMark.position.character);
                            }
                            else if (ch !== '\n' && pos.line === newMark.position.line) {
                                newMark.position = new position_1.Position(newMark.position.line, newMark.position.character + 1);
                            }
                        }
                        // Advance position
                        if (ch === '\n') {
                            pos = new position_1.Position(pos.line + 1, 0);
                        }
                        else {
                            pos = new position_1.Position(pos.line, pos.character + 1);
                        }
                    }
                }
                else {
                    for (const ch of change.text) {
                        // Update mark
                        if (pos.compareTo(newMark.position) < 0) {
                            if (ch === '\n') {
                                newMark.position = new position_1.Position(newMark.position.line - 1, newMark.position.character);
                            }
                            else if (pos.line === newMark.position.line) {
                                newMark.position = new position_1.Position(newMark.position.line, newMark.position.character - 1);
                            }
                        }
                        // De-advance position
                        // (What's the opposite of advance? Retreat position?)
                        if (ch === '\n') {
                            // The 99999 is a bit of a hack here. It's very difficult and
                            // completely unnecessary to get the correct position, so we
                            // just fake it.
                            pos = new position_1.Position(Math.max(pos.line - 1, 0), 99999);
                        }
                        else {
                            pos = new position_1.Position(pos.line, Math.max(pos.character - 1, 0));
                        }
                    }
                }
            }
        }
        // Ensure the position of every mark is within the range of the document.
        for (const mark of newMarks) {
            if (mark.position.compareTo(mark.position.getDocumentEnd()) > 0) {
                mark.position = mark.position.getDocumentEnd();
            }
        }
        return newMarks;
    }
    /**
     * Adds a mark.
     */
    addMark(position, markName) {
        const newMark = {
            position,
            name: markName,
            isUppercaseMark: markName === markName.toUpperCase(),
        };
        const previousIndex = _.findIndex(this.currentHistoryStep.marks, mark => mark.name === markName);
        if (previousIndex !== -1) {
            this.currentHistoryStep.marks[previousIndex] = newMark;
        }
        else {
            this.currentHistoryStep.marks.push(newMark);
        }
    }
    /**
     * Retrieves a mark.
     */
    getMark(markName) {
        return _.find(this.currentHistoryStep.marks, mark => mark.name === markName);
    }
    getMarks() {
        return this.currentHistoryStep.marks;
    }
    /**
     * Adds an individual Change to the current Step.
     *
     * Determines what changed by diffing the document against what it
     * used to look like.
     */
    addChange(cursorPosition = [new position_1.Position(0, 0)]) {
        const newText = this._getDocumentText();
        if (newText === this.oldText) {
            return;
        }
        // Determine if we should add a new Step.
        if (this.currentHistoryStepIndex === this.historySteps.length - 1 &&
            this.currentHistoryStep.isFinished) {
            this._addNewHistoryStep();
        }
        else if (this.currentHistoryStepIndex !== this.historySteps.length - 1) {
            this.historySteps = this.historySteps.slice(0, this.currentHistoryStepIndex + 1);
            this._addNewHistoryStep();
        }
        // TODO: This is actually pretty stupid! Since we already have the cursorPosition,
        // and most diffs are just +/- a few characters, we can just do a direct comparison rather
        // than using jsdiff.
        // The difficulty is with a few rare commands like :%s/one/two/g that make
        // multiple changes in different places simultaneously. For those, we could require
        // them to call addChange manually, I guess...
        const diffs = diffEngine.diff_main(this.oldText, newText);
        /*
        this.historySteps.push(new HistoryStep({
          changes  : [new DocumentChange(new Position(0, 0), TextEditor._getDocumentText(), true)],
          isFinished : true,
          cursorStart: new Position(0, 0)
        }));
        */
        let currentPosition = new position_1.Position(0, 0);
        for (const diff of diffs) {
            const [whatHappened, text] = diff;
            const added = whatHappened === DiffMatchPatch.DIFF_INSERT;
            const removed = whatHappened === DiffMatchPatch.DIFF_DELETE;
            let change;
            // let lastChange = this.currentHistoryStep.changes.length > 1 &&
            //   this.currentHistoryStep.changes[this.currentHistoryStep.changes.length - 2];
            if (added || removed) {
                change = new DocumentChange(currentPosition, text, !!added);
                this.currentHistoryStep.changes.push(change);
                if (change && this.currentHistoryStep.cursorStart === undefined) {
                    this.currentHistoryStep.cursorStart = cursorPosition;
                }
            }
            if (!removed) {
                currentPosition = currentPosition.advancePositionByText(text);
            }
        }
        this.currentHistoryStep.cursorEnd = cursorPosition;
        this.oldText = newText;
        // A change has been made, reset the changelist navigation index to the end
        this.changelistIndex = this.historySteps.length - 1;
    }
    /**
     * Both undoes and completely removes the last n changes applied.
     */
    undoAndRemoveChanges(n) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentHistoryStep.changes.length < n) {
                this._logger.warn('Something bad happened in removeChange');
                return;
            }
            for (let i = 0; i < n; i++) {
                yield this.currentHistoryStep.changes.pop().undo();
            }
            this.ignoreChange();
        });
    }
    /**
     * Tells the HistoryTracker that although the document has changed, we should simply
     * ignore that change. Most often used when the change was itself triggered by
     * the HistoryTracker.
     */
    ignoreChange() {
        this.oldText = this._getDocumentText();
    }
    /**
     * Until we mark it as finished, the active Step will
     * accrue multiple changes. This function will mark it as finished,
     * and the next time we add a change, it'll be added to a new Step.
     */
    finishCurrentStep() {
        if (this.currentHistoryStep.changes.length === 0 || this.currentHistoryStep.isFinished) {
            return;
        }
        this.currentHistoryStep.isFinished = true;
        this.currentHistoryStep.merge();
        this.currentHistoryStep.marks = this.updateAndReturnMarks();
    }
    /**
     * Essentially Undo or ctrl+z. Returns undefined if there's no more steps
     * back to go.
     */
    goBackHistoryStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let step;
            if (this.currentHistoryStepIndex === 0) {
                return undefined;
            }
            if (this.currentHistoryStep.changes.length === 0) {
                this.currentHistoryStepIndex--;
                if (this.currentHistoryStepIndex === 0) {
                    return undefined;
                }
            }
            step = this.currentHistoryStep;
            for (const change of step.changes.slice(0).reverse()) {
                yield change.undo();
            }
            this.currentHistoryStepIndex--;
            return step && step.cursorStart;
        });
    }
    /**
     * Logic for command U.
     *
     * Performs an undo action for all changes which occurred on
     * the same line as the most recent change.
     * Returns undefined if there's no more steps back to go.
     * Only acts upon consecutive changes on the most-recently-changed line.
     * U itself is a change, so all the changes are reversed and added back
     * to the history.
     *
     * This method contains a significant amount of extra logic to account for
     * the difficult scenario where a newline is embedded in a change (ex: '\nhello'), which
     * is created by the 'o' command. Vim behavior for the 'U' command does
     * not undo newlines, so the change text needs to be checked & trimmed.
     * This worst-case scenario tends to offset line values and make it harder to
     * determine the line of the change, so this behavior is also compensated.
     */
    goBackHistoryStepsOnLine() {
        return __awaiter(this, void 0, void 0, function* () {
            let done = false;
            let stepsToUndo = 0;
            let changesToUndo = [];
            if (this.currentHistoryStepIndex === 0) {
                return undefined;
            }
            if (this.currentHistoryStep.changes.length === 0) {
                this.currentHistoryStepIndex--;
                if (this.currentHistoryStepIndex === 0) {
                    return undefined;
                }
            }
            let lastChange = this.currentHistoryStep.changes[0];
            let currentLine = this.currentHistoryStep.changes[this.currentHistoryStep.changes.length - 1]
                .start.line;
            // Adjusting for the case where the most recent change is newline followed by text
            const mostRecentText = this.currentHistoryStep.changes[0].text;
            if (mostRecentText.includes('\n') && mostRecentText !== '\n' && mostRecentText !== '\r\n') {
                currentLine++;
            }
            for (const step of this.historySteps.slice(1, this.currentHistoryStepIndex + 1).reverse()) {
                for (let change of step.changes.reverse()) {
                    /*
                     * This conditional accounts for the behavior where the change is a newline
                     * followed by text to undo. Note the line offset behavior that must be compensated.
                     */
                    if (change.text.includes('\n') && change.start.line + 1 === currentLine) {
                        done = true;
                        // Modify & replace the change to avoid undoing the newline embedded in the change
                        change = new DocumentChange(new position_1.Position(change.start.line + 1, 0), change.text.replace('\n', '').replace('\r', ''), change.isAdd);
                        stepsToUndo++;
                    }
                    if (change.text.includes('\n') || change.start.line !== currentLine) {
                        done = true;
                        break;
                    }
                    changesToUndo.push(change);
                    lastChange = change;
                    if (done) {
                        break;
                    }
                }
                if (done) {
                    break;
                }
                stepsToUndo++;
            }
            // Note that reverse() is call-by-reference, so the changes are already in reverse order
            for (const change of changesToUndo) {
                yield change.undo();
                change.isAdd = !change.isAdd;
            }
            for (let count = stepsToUndo; count > 0; count--) {
                this.historySteps.pop();
            }
            const newStep = new HistoryStep({
                isFinished: true,
                cursorStart: [lastChange.start],
                cursorEnd: [lastChange.start],
            });
            newStep.changes = changesToUndo;
            this.historySteps.push(newStep);
            this.currentHistoryStepIndex = this.currentHistoryStepIndex - stepsToUndo + 1;
            /*
             * Unlike the goBackHistoryStep() function, this function does not trust the
             * HistoryStep.cursorStart property. This can lead to invalid cursor position errors.
             * Since this function reverses change-by-change, rather than step-by-step,
             * the cursor position is based on the start of the last change that is undone.
             */
            return lastChange && [lastChange.start];
        });
    }
    /**
     * Essentially Redo or ctrl+y. Returns undefined if there's no more steps
     * forward to go.
     */
    goForwardHistoryStep() {
        return __awaiter(this, void 0, void 0, function* () {
            let step;
            if (this.currentHistoryStepIndex === this.historySteps.length - 1) {
                return undefined;
            }
            this.currentHistoryStepIndex++;
            step = this.currentHistoryStep;
            for (const change of step.changes) {
                yield change.do();
            }
            return step.cursorStart;
        });
    }
    getLastHistoryEndPosition() {
        if (this.currentHistoryStepIndex === 0) {
            return undefined;
        }
        return this.historySteps[this.currentHistoryStepIndex].cursorEnd;
    }
    /**
     * Gets the ending cursor position of the last Change of the last Step.
     *
     * In practice, this sets the cursor position to the end of
     * the most recent text change.
     */
    getLastChangeEndPosition() {
        if (this.currentHistoryStepIndex === 0) {
            return undefined;
        }
        const lastChangeIndex = this.historySteps[this.currentHistoryStepIndex].changes.length;
        if (lastChangeIndex === 0) {
            return undefined;
        }
        return this.historySteps[this.currentHistoryStepIndex].changes[lastChangeIndex - 1].end();
    }
    getLastHistoryStartPosition() {
        if (this.currentHistoryStepIndex === 0) {
            return undefined;
        }
        return this.historySteps[this.currentHistoryStepIndex].cursorStart;
    }
    setLastHistoryEndPosition(pos) {
        this.historySteps[this.currentHistoryStepIndex].cursorEnd = pos;
    }
    getChangePositionAtindex(index) {
        if (this.currentHistoryStepIndex === 0) {
            return undefined;
        }
        let pos = this.getLastHistoryEndPosition();
        pos = undefined;
        if (this.historySteps[index] !== undefined) {
            if (this.historySteps[index].changes.length > 0) {
                if (this.historySteps[index].changes[0].isAdd) {
                    pos = [this.historySteps[index].changes[0].end()];
                }
                else {
                    pos = [this.historySteps[index].changes[0].start];
                }
            }
        }
        return pos;
    }
    /**
     * Handy for debugging the undo/redo stack. + means our current position, check
     * means active.
     */
    toString() {
        let result = '';
        for (let i = 0; i < this.historySteps.length; i++) {
            const step = this.historySteps[i];
            result += step.changes.map(x => x.text.replace(/\n/g, '\\n')).join('');
            if (this.currentHistoryStepIndex === i) {
                result += '+';
            }
            if (step.isFinished) {
                result += '✓';
            }
            result += '| ';
        }
        return result;
    }
}
exports.HistoryTracker = HistoryTracker;

//# sourceMappingURL=historyTracker.js.map
