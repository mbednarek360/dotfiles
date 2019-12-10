"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration_1 = require("./../../configuration/configuration");
const textEditor_1 = require("./../../textEditor");
const _ = require("lodash");
const mode_1 = require("../../mode/mode");
var PositionDiffType;
(function (PositionDiffType) {
    PositionDiffType[PositionDiffType["Offset"] = 0] = "Offset";
    PositionDiffType[PositionDiffType["BOL"] = 1] = "BOL";
    PositionDiffType[PositionDiffType["ObeyStartOfLine"] = 2] = "ObeyStartOfLine";
})(PositionDiffType || (PositionDiffType = {}));
/**
 * Represents a difference between two positions. Add it to a position
 * to get another position. Create it with the factory methods:
 *
 * - NewDiff
 * - NewBOLDiff (BOL = Beginning Of Line)
 */
class PositionDiff {
    constructor(line, character) {
        this._line = line;
        this._character = character;
        this._type = PositionDiffType.Offset;
    }
    /**
     * Creates a new PositionDiff that always brings the cursor to the beginning
     * of the line when * applied to a position. If `obeysStartOfLine` is true,
     * it will go to BOL only if `vim.startofline` is true.
     */
    static NewBOLDiff(line = 0, character = 0, obeysStartOfLine = false) {
        const result = new PositionDiff(line, character);
        result._type = obeysStartOfLine ? PositionDiffType.ObeyStartOfLine : PositionDiffType.BOL;
        return result;
    }
    /**
     * Add this PositionDiff to another PositionDiff.
     */
    addDiff(other) {
        if (this._type !== PositionDiffType.Offset || other._type !== PositionDiffType.Offset) {
            throw new Error("johnfn hasn't done this case yet and doesnt want to");
        }
        return new PositionDiff(this._line + other._line, this._character + other._character);
    }
    get type() {
        return this._type;
    }
    /**
     * Difference in lines.
     */
    get line() {
        return this._line;
    }
    /**
     * Difference in characters.
     */
    get character() {
        return this._character;
    }
    toString() {
        switch (this._type) {
            case PositionDiffType.Offset:
                return `[ Diff: ${this._line} ${this._character} ]`;
            case PositionDiffType.BOL:
                return '[ Diff: BOL ]';
            case PositionDiffType.ObeyStartOfLine:
                return '[ Diff: ObeyStartOfLine ]';
            default:
                throw new Error('Unknown PositionDiffType');
        }
    }
}
exports.PositionDiff = PositionDiff;
class Position extends vscode.Position {
    constructor(line, character) {
        super(line, character);
    }
    toString() {
        return `[${this.line}, ${this.character}]`;
    }
    static FromVSCodePosition(pos) {
        return new Position(pos.line, pos.character);
    }
    /**
     * Returns which of the 2 provided Positions comes earlier in the document.
     */
    static EarlierOf(p1, p2) {
        if (p1.line < p2.line) {
            return p1;
        }
        if (p1.line === p2.line && p1.character < p2.character) {
            return p1;
        }
        return p2;
    }
    isEarlierThan(other) {
        if (this.line < other.line) {
            return true;
        }
        if (this.line === other.line && this.character < other.character) {
            return true;
        }
        return false;
    }
    /**
     * Returns which of the 2 provided Positions comes later in the document.
     */
    static LaterOf(p1, p2) {
        if (Position.EarlierOf(p1, p2) === p1) {
            return p2;
        }
        return p1;
    }
    /**
     * Iterates over every position in the document starting at start, returning
     * at every position the current line text, character text, and a position object.
     */
    static *IterateDocument(start, forward = true) {
        let lineIndex, charIndex;
        if (forward) {
            for (lineIndex = start.line; lineIndex < textEditor_1.TextEditor.getLineCount(); lineIndex++) {
                charIndex = lineIndex === start.line ? start.character : 0;
                const line = textEditor_1.TextEditor.getLineAt(new Position(lineIndex, 0)).text;
                for (; charIndex < line.length; charIndex++) {
                    yield {
                        line: line,
                        char: line[charIndex],
                        pos: new Position(lineIndex, charIndex),
                    };
                }
            }
        }
        else {
            for (lineIndex = start.line; lineIndex >= 0; lineIndex--) {
                const line = textEditor_1.TextEditor.getLineAt(new Position(lineIndex, 0)).text;
                charIndex = lineIndex === start.line ? start.character : line.length - 1;
                for (; charIndex >= 0; charIndex--) {
                    yield {
                        line: line,
                        char: line[charIndex],
                        pos: new Position(lineIndex, charIndex),
                    };
                }
            }
        }
    }
    /**
     * Iterate over every position in the block defined by the two positions passed in.
     */
    static *IterateBlock(topLeft, bottomRight) {
        for (let lineIndex = topLeft.line; lineIndex <= bottomRight.line; lineIndex++) {
            const line = textEditor_1.TextEditor.getLineAt(new Position(lineIndex, 0)).text;
            for (let charIndex = topLeft.character; charIndex < bottomRight.character + 1; charIndex++) {
                yield {
                    line: line,
                    char: line[charIndex],
                    pos: new Position(lineIndex, charIndex),
                };
            }
        }
    }
    /**
     * Iterate over every position in the selection defined by the two positions passed in.
     */
    static *IterateSelection(topLeft, bottomRight) {
        for (let lineIndex = topLeft.line; lineIndex <= bottomRight.line; lineIndex++) {
            const line = textEditor_1.TextEditor.getLineAt(new Position(lineIndex, 0)).text;
            if (lineIndex === topLeft.line) {
                for (let charIndex = topLeft.character; charIndex < line.length + 1; charIndex++) {
                    yield {
                        line: line,
                        char: line[charIndex],
                        pos: new Position(lineIndex, charIndex),
                    };
                }
            }
            else if (lineIndex === bottomRight.line) {
                for (let charIndex = 0; charIndex < bottomRight.character + 1; charIndex++) {
                    yield {
                        line: line,
                        char: line[charIndex],
                        pos: new Position(lineIndex, charIndex),
                    };
                }
            }
            else {
                for (let charIndex = 0; charIndex < line.length + 1; charIndex++) {
                    yield {
                        line: line,
                        char: line[charIndex],
                        pos: new Position(lineIndex, charIndex),
                    };
                }
            }
        }
    }
    /**
     * Iterate over every line in the block defined by the two positions passed in.
     *
     * This is intended for visual block mode.
     */
    static *IterateLine(vimState, options = { reverse: false }) {
        const { reverse } = options;
        const start = vimState.cursorStartPosition;
        const stop = vimState.cursorStopPosition;
        const topLeft = mode_1.visualBlockGetTopLeftPosition(start, stop);
        const bottomRight = mode_1.visualBlockGetBottomRightPosition(start, stop);
        // Special case for $, which potentially makes the block ragged
        // on the right side.
        const runToLineEnd = vimState.desiredColumn === Number.POSITIVE_INFINITY;
        const itrStart = reverse ? bottomRight.line : topLeft.line;
        const itrEnd = reverse ? topLeft.line : bottomRight.line;
        for (let lineIndex = itrStart; reverse ? lineIndex >= itrEnd : lineIndex <= itrEnd; reverse ? lineIndex-- : lineIndex++) {
            const line = textEditor_1.TextEditor.getLineAt(new Position(lineIndex, 0)).text;
            const endCharacter = runToLineEnd
                ? line.length + 1
                : Math.min(line.length, bottomRight.character + 1);
            yield {
                line: line.substring(topLeft.character, endCharacter),
                start: new Position(lineIndex, topLeft.character),
                end: new Position(lineIndex, endCharacter),
            };
        }
    }
    /**
     * Iterates through words on the same line, starting from the current position.
     */
    static *IterateWords(start) {
        const text = textEditor_1.TextEditor.getLineAt(start).text;
        let wordEnd = start.getCurrentWordEnd(true);
        do {
            const word = text.substring(start.character, wordEnd.character + 1);
            yield {
                start: start,
                end: wordEnd,
                word: word,
            };
            if (wordEnd.getRight().isLineEnd()) {
                return;
            }
            start = start.getWordRight();
            wordEnd = start.getCurrentWordEnd(true);
        } while (true);
    }
    /**
     * Subtracts another position from this one, returning the difference between the two.
     */
    subtract(other) {
        return new PositionDiff(this.line - other.line, this.character - other.character);
    }
    /**
     * Adds a PositionDiff to this position, returning a new position.
     */
    add(diff, { boundsCheck = true } = {}) {
        let resultLine = this.line + diff.line;
        let resultChar = this.character;
        if (diff.type === PositionDiffType.Offset) {
            resultChar += diff.character;
        }
        else if (diff.type === PositionDiffType.BOL) {
            resultChar = diff.character;
        }
        else if (diff.type === PositionDiffType.ObeyStartOfLine && configuration_1.configuration.startofline) {
            resultChar = new Position(resultLine, 0).obeyStartOfLine().character;
        }
        if (boundsCheck) {
            if (resultChar < 0) {
                resultChar = 0;
            }
            if (resultLine < 0) {
                resultLine = 0;
            }
            // TODO: check character does not go over line's max
            if (resultLine >= textEditor_1.TextEditor.getLineCount() - 1) {
                resultLine = textEditor_1.TextEditor.getLineCount() - 1;
            }
        }
        return new Position(resultLine, resultChar);
    }
    withLine(line) {
        return new Position(line, this.character);
    }
    withColumn(column) {
        return new Position(this.line, column);
    }
    getLeftTabStop() {
        if (!this.isLineBeginning()) {
            let indentationWidth = textEditor_1.TextEditor.getIndentationLevel(textEditor_1.TextEditor.getLineAt(this).text);
            let tabSize = vscode.window.activeTextEditor.options.tabSize;
            if (indentationWidth % tabSize > 0) {
                return new Position(this.line, Math.max(0, this.character - (indentationWidth % tabSize)));
            }
            else {
                return new Position(this.line, Math.max(0, this.character - tabSize));
            }
        }
        return this;
    }
    /**
     * Gets the position one or more to the left of this position. Does not go up line
     * breaks.
     */
    getLeft(count = 1) {
        let newCharacter = Math.max(this.character - count, 0);
        if (newCharacter !== this.character) {
            return new Position(this.line, newCharacter);
        }
        return this;
    }
    /**
     * Same as getLeft, but goes up to the previous line on line
     * breaks.
     *
     * Equivalent to left arrow (in a non-vim editor!)
     */
    getLeftThroughLineBreaks(includeEol = true) {
        if (!this.isLineBeginning()) {
            return this.getLeft();
        }
        // First char on first line, can not go left any more
        if (this.line === 0) {
            return this;
        }
        if (includeEol) {
            return this.getUp(0).getLineEnd();
        }
        else {
            return this.getUp(0)
                .getLineEnd()
                .getLeft();
        }
    }
    getRightThroughLineBreaks(includeEol = false) {
        if (this.isAtDocumentEnd()) {
            // TODO(bell)
            return this;
        }
        if (this.isLineEnd()) {
            return this.getDown(0);
        }
        if (!includeEol && this.getRight().isLineEnd()) {
            return this.getDown(0);
        }
        return this.getRight();
    }
    getOffsetThroughLineBreaks(offset) {
        let pos = new Position(this.line, this.character);
        if (offset < 0) {
            for (let i = 0; i < -offset; i++) {
                pos = pos.getLeftThroughLineBreaks();
            }
        }
        else {
            for (let i = 0; i < offset; i++) {
                pos = pos.getRightThroughLineBreaks();
            }
        }
        return pos;
    }
    getRight(count = 1) {
        if (!this.isLineEnd()) {
            return new Position(this.line, this.character + count);
        }
        return this;
    }
    /**
     * Get the position of the line directly below the current line.
     */
    getDown(desiredColumn) {
        if (this.getDocumentEnd().line !== this.line) {
            let nextLine = this.line + 1;
            let nextLineLength = Position.getLineLength(nextLine);
            return new Position(nextLine, Math.min(nextLineLength, desiredColumn));
        }
        return this;
    }
    /**
     * Get the position of the line directly above the current line.
     */
    getUp(desiredColumn) {
        if (this.getDocumentBegin().line !== this.line) {
            let prevLine = this.line - 1;
            let prevLineLength = Position.getLineLength(prevLine);
            return new Position(prevLine, Math.min(prevLineLength, desiredColumn));
        }
        return this;
    }
    /**
     * Get the position *count* lines down from this position, but not lower
     * than the end of the document.
     */
    getDownByCount(count = 0, { boundsCheck = true } = {}) {
        const line = boundsCheck
            ? Math.min(textEditor_1.TextEditor.getLineCount() - 1, this.line + count)
            : this.line + count;
        return new Position(line, this.character);
    }
    /**
     * Get the position *count* lines up from this position, but not higher
     * than the end of the document.
     */
    getUpByCount(count = 0) {
        return new Position(Math.max(0, this.line - count), this.character);
    }
    /**
     * Get the position *count* lines left from this position, but not farther
     * than the beginning of the line
     */
    getLeftByCount(count = 0) {
        return new Position(this.line, Math.max(0, this.character - count));
    }
    /**
     * Get the position *count* lines right from this position, but not farther
     * than the end of the line
     */
    getRightByCount(count = 0) {
        return new Position(this.line, Math.min(textEditor_1.TextEditor.getLineAt(this).text.length - 1, this.character + count));
    }
    /**
     * Get the position of the word counting from the position specified.
     * @param text The string to search from.
     * @param pos The position of text to search from.
     * @param inclusive true if we consider the pos a valid result, false otherwise.
     * @returns The character position of the word to the left relative to the text and the pos.
     *          undefined if there is no word to the left of the postion.
     */
    static getWordLeft(text, pos, inclusive = false) {
        return Position.getWordLeftWithRegex(text, pos, Position._nonWordCharRegex, inclusive);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getWordLeft(inclusive = false) {
        return this.getWordLeftWithRegex(Position._nonWordCharRegex, inclusive);
    }
    getBigWordLeft(inclusive = false) {
        return this.getWordLeftWithRegex(Position._nonBigWordCharRegex, inclusive);
    }
    getCamelCaseWordLeft(inclusive = false) {
        return this.getWordLeftWithRegex(Position._nonCamelCaseWordCharRegex, inclusive);
    }
    getFilePathLeft(inclusive = false) {
        return this.getWordLeftWithRegex(Position._nonFileNameRegex, inclusive);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getWordRight(inclusive = false) {
        return this.getWordRightWithRegex(Position._nonWordCharRegex, inclusive);
    }
    getBigWordRight(inclusive = false) {
        return this.getWordRightWithRegex(Position._nonBigWordCharRegex);
    }
    getCamelCaseWordRight(inclusive = false) {
        return this.getWordRightWithRegex(Position._nonCamelCaseWordCharRegex);
    }
    getFilePathRight(inclusive = false) {
        return this.getWordRightWithRegex(Position._nonFileNameRegex, inclusive);
    }
    getLastWordEnd() {
        return this.getLastWordEndWithRegex(Position._nonWordCharRegex);
    }
    getLastBigWordEnd() {
        return this.getLastWordEndWithRegex(Position._nonBigWordCharRegex);
    }
    getLastCamelCaseWordEnd() {
        return this.getLastWordEndWithRegex(Position._nonCamelCaseWordCharRegex);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getCurrentWordEnd(inclusive = false) {
        return this.getCurrentWordEndWithRegex(Position._nonWordCharRegex, inclusive);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getCurrentBigWordEnd(inclusive = false) {
        return this.getCurrentWordEndWithRegex(Position._nonBigWordCharRegex, inclusive);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getCurrentCamelCaseWordEnd(inclusive = false) {
        return this.getCurrentWordEndWithRegex(Position._nonCamelCaseWordCharRegex, inclusive);
    }
    /**
     * Get the boundary position of the section.
     */
    getSectionBoundary(args) {
        let pos = this;
        if ((args.forward && pos.line === textEditor_1.TextEditor.getLineCount() - 1) ||
            (!args.forward && pos.line === 0)) {
            return pos.getFirstLineNonBlankChar();
        }
        pos = args.forward ? pos.getDown(0) : pos.getUp(0);
        while (!textEditor_1.TextEditor.getLineAt(pos).text.startsWith(args.boundary)) {
            if (args.forward) {
                if (pos.line === textEditor_1.TextEditor.getLineCount() - 1) {
                    break;
                }
                pos = pos.getDown(0);
            }
            else {
                if (pos.line === 0) {
                    break;
                }
                pos = pos.getUp(0);
            }
        }
        return pos.getFirstLineNonBlankChar();
    }
    /**
     * Get the end of the current paragraph.
     */
    getCurrentParagraphEnd(trimWhite = false) {
        let pos = this;
        // If we're not in a paragraph yet, go down until we are.
        while (pos.isLineBlank(trimWhite) && !textEditor_1.TextEditor.isLastLine(pos)) {
            pos = pos.getDown(0);
        }
        // Go until we're outside of the paragraph, or at the end of the document.
        while (!pos.isLineBlank(trimWhite) && pos.line < textEditor_1.TextEditor.getLineCount() - 1) {
            pos = pos.getDown(0);
        }
        return pos.getLineEnd();
    }
    /**
     * Get the beginning of the current paragraph.
     */
    getCurrentParagraphBeginning(trimWhite = false) {
        let pos = this;
        // If we're not in a paragraph yet, go up until we are.
        while (pos.isLineBlank(trimWhite) && !textEditor_1.TextEditor.isFirstLine(pos)) {
            pos = pos.getUp(0);
        }
        // Go until we're outside of the paragraph, or at the beginning of the document.
        while (pos.line > 0 && !pos.isLineBlank(trimWhite)) {
            pos = pos.getUp(0);
        }
        return pos.getLineBegin();
    }
    isLineBlank(trimWhite = false) {
        let text = textEditor_1.TextEditor.getLineAt(this).text;
        return (trimWhite ? text.trim() : text) === '';
    }
    isLineWhite() {
        return this.isLineBlank(true);
    }
    getSentenceBegin(args) {
        if (args.forward) {
            return this.getNextSentenceBeginWithRegex(Position._sentenceEndRegex, false);
        }
        else {
            return this.getPreviousSentenceBeginWithRegex(Position._sentenceEndRegex);
        }
    }
    getCurrentSentenceEnd() {
        return this.getCurrentSentenceEndWithRegex(Position._sentenceEndRegex, false);
    }
    /**
     * Get the beginning of the current line.
     */
    getLineBegin() {
        return new Position(this.line, 0);
    }
    /**
     * Get the beginning of the line, excluding preceeding whitespace.
     * This respects the `autoindent` setting, and returns `getLineBegin()` if auto-indent
     * is disabled.
     */
    getLineBeginRespectingIndent() {
        if (!configuration_1.configuration.autoindent) {
            return this.getLineBegin();
        }
        return this.getFirstLineNonBlankChar();
    }
    /**
     * Get the beginning of the next line.
     */
    getPreviousLineBegin() {
        if (this.line === 0) {
            return this.getLineBegin();
        }
        return new Position(this.line - 1, 0);
    }
    /**
     * Get the beginning of the next line.
     */
    getNextLineBegin() {
        if (this.line >= textEditor_1.TextEditor.getLineCount() - 1) {
            return this.getLineEnd();
        }
        return new Position(this.line + 1, 0);
    }
    /**
     * Returns a new position at the end of this position's line.
     */
    getLineEnd() {
        return new Position(this.line, Position.getLineLength(this.line));
    }
    /**
     * Returns a new position at the end of this position's line, including the
     * invisible newline character.
     */
    getLineEndIncludingEOL() {
        return new Position(this.line, Position.getLineLength(this.line) + 1);
    }
    getDocumentBegin() {
        return new Position(0, 0);
    }
    /**
     * Returns a new Position one to the left if this position is on the EOL. Otherwise,
     * returns this position.
     */
    getLeftIfEOL() {
        if (this.character === Position.getLineLength(this.line)) {
            return this.getLeft();
        }
        else {
            return this;
        }
    }
    /**
     * Get the position that the cursor would be at if you
     * pasted *text* at the current position.
     */
    advancePositionByText(text) {
        const numberOfLinesSpanned = (text.match(/\n/g) || []).length;
        return new Position(this.line + numberOfLinesSpanned, numberOfLinesSpanned === 0
            ? this.character + text.length
            : text.length - (text.lastIndexOf('\n') + 1));
    }
    getDocumentEnd(textEditor) {
        textEditor = textEditor || vscode.window.activeTextEditor;
        let lineCount = textEditor_1.TextEditor.getLineCount(textEditor);
        let line = lineCount > 0 ? lineCount - 1 : 0;
        let char = Position.getLineLength(line);
        return new Position(line, char);
    }
    /**
     * Is this position at the beginning of the line?
     */
    isLineBeginning() {
        return this.character === 0;
    }
    /**
     * Is this position at the end of the line?
     */
    isLineEnd() {
        return this.character >= Position.getLineLength(this.line);
    }
    isFirstWordOfLine() {
        return Position.getFirstNonBlankCharAtLine(this.line) === this.character;
    }
    isAtDocumentBegin() {
        return this.line === 0 && this.isLineBeginning();
    }
    isAtDocumentEnd() {
        return this.line === textEditor_1.TextEditor.getLineCount() - 1 && this.isLineEnd();
    }
    /**
     * Returns whether the current position is in the leading whitespace of a line
     * @param allowEmpty : Use true if "" is valid
     */
    isInLeadingWhitespace(allowEmpty = false) {
        if (allowEmpty) {
            return /^\s*$/.test(textEditor_1.TextEditor.getText(new vscode.Range(this.getLineBegin(), this)));
        }
        else {
            return /^\s+$/.test(textEditor_1.TextEditor.getText(new vscode.Range(this.getLineBegin(), this)));
        }
    }
    static getFirstNonBlankCharAtLine(line) {
        return textEditor_1.TextEditor.readLineAt(line).match(/^\s*/)[0].length;
    }
    /**
     * The position of the first character on this line which is not whitespace.
     */
    getFirstLineNonBlankChar() {
        return new Position(this.line, Position.getFirstNonBlankCharAtLine(this.line));
    }
    /**
     * If `vim.startofline` is set, get first non-blank character's position.
     */
    obeyStartOfLine() {
        return configuration_1.configuration.startofline ? this.getFirstLineNonBlankChar() : this;
    }
    static getLineLength(line) {
        return textEditor_1.TextEditor.readLineAt(line).length;
    }
    isValid(textEditor) {
        try {
            // line
            let lineCount = textEditor_1.TextEditor.getLineCount(textEditor) || 1;
            if (this.line >= lineCount) {
                return false;
            }
            // char
            let charCount = Position.getLineLength(this.line);
            if (this.character > charCount + 1) {
                return false;
            }
        }
        catch (e) {
            return false;
        }
        return true;
    }
    static makeWordRegex(characterSet) {
        let escaped = characterSet && _.escapeRegExp(characterSet).replace(/-/g, '\\-');
        let segments = [];
        segments.push(`([^\\s${escaped}]+)`);
        segments.push(`[${escaped}]+`);
        segments.push(`$^`);
        let result = new RegExp(segments.join('|'), 'g');
        return result;
    }
    static makeCamelCaseWordRegex(characterSet) {
        const escaped = characterSet && _.escapeRegExp(characterSet).replace(/-/g, '\\-');
        const segments = [];
        // old versions of VSCode before 1.31 will crash when trying to parse a regex with a lookbehind
        let supportsLookbehind = true;
        try {
            // tslint:disable-next-line
            new RegExp('(<=x)');
        }
        catch (_a) {
            supportsLookbehind = false;
        }
        // prettier-ignore
        const firstSegment = '(' + // OPEN: group for matching camel case words
            `[^\\s${escaped}]` + //   words can start with any word character
            '(?:' + //   OPEN: group for characters after initial char
            `(?:${supportsLookbehind ? '(?<=[A-Z_])' : ''}` + //     If first char was a capital
            `[A-Z](?=[\\sA-Z0-9${escaped}_]))+` + //       the word can continue with all caps
            '|' + //     OR
            `(?:${supportsLookbehind ? '(?<=[0-9_])' : ''}` + //     If first char was a digit
            `[0-9](?=[\\sA-Z0-9${escaped}_]))+` + //       the word can continue with all digits
            '|' + //     OR
            `(?:${supportsLookbehind ? '(?<=[_])' : ''}` + //     If first char was an underscore
            `[_](?=[\\s${escaped}_]))+` + //       the word can continue with all underscores
            '|' + //     OR
            `[^\\sA-Z0-9${escaped}_]*` + //     Continue with regular characters
            ')' + //   END: group for characters after initial char
            ')' + // END: group for matching camel case words
            '';
        segments.push(firstSegment);
        segments.push(`[${escaped}]+`);
        segments.push(`$^`);
        // it can be difficult to grok the behavior of the above regex
        // feel free to check out https://regex101.com/r/mkVeiH/1 as a live example
        const result = new RegExp(segments.join('|'), 'g');
        return result;
    }
    static makeUnicodeWordRegex(keywordChars) {
        // Distinct categories of characters
        let CharKind;
        (function (CharKind) {
            CharKind[CharKind["Punctuation"] = 0] = "Punctuation";
            CharKind[CharKind["Superscript"] = 1] = "Superscript";
            CharKind[CharKind["Subscript"] = 2] = "Subscript";
            CharKind[CharKind["Braille"] = 3] = "Braille";
            CharKind[CharKind["Ideograph"] = 4] = "Ideograph";
            CharKind[CharKind["Hiragana"] = 5] = "Hiragana";
            CharKind[CharKind["Katakana"] = 6] = "Katakana";
            CharKind[CharKind["Hangul"] = 7] = "Hangul";
        })(CharKind || (CharKind = {}));
        // List of printable characters (code point intervals) and their character kinds.
        // Latin alphabets (e.g., ASCII alphabets and numbers,  Latin-1 Supplement, European Latin) are excluded.
        // Imported from utf_class_buf in src/mbyte.c of Vim.
        const symbolTable = [
            [[0x00a1, 0x00bf], CharKind.Punctuation],
            [[0x037e, 0x037e], CharKind.Punctuation],
            [[0x0387, 0x0387], CharKind.Punctuation],
            [[0x055a, 0x055f], CharKind.Punctuation],
            [[0x0589, 0x0589], CharKind.Punctuation],
            [[0x05be, 0x05be], CharKind.Punctuation],
            [[0x05c0, 0x05c0], CharKind.Punctuation],
            [[0x05c3, 0x05c3], CharKind.Punctuation],
            [[0x05f3, 0x05f4], CharKind.Punctuation],
            [[0x060c, 0x060c], CharKind.Punctuation],
            [[0x061b, 0x061b], CharKind.Punctuation],
            [[0x061f, 0x061f], CharKind.Punctuation],
            [[0x066a, 0x066d], CharKind.Punctuation],
            [[0x06d4, 0x06d4], CharKind.Punctuation],
            [[0x0700, 0x070d], CharKind.Punctuation],
            [[0x0964, 0x0965], CharKind.Punctuation],
            [[0x0970, 0x0970], CharKind.Punctuation],
            [[0x0df4, 0x0df4], CharKind.Punctuation],
            [[0x0e4f, 0x0e4f], CharKind.Punctuation],
            [[0x0e5a, 0x0e5b], CharKind.Punctuation],
            [[0x0f04, 0x0f12], CharKind.Punctuation],
            [[0x0f3a, 0x0f3d], CharKind.Punctuation],
            [[0x0f85, 0x0f85], CharKind.Punctuation],
            [[0x104a, 0x104f], CharKind.Punctuation],
            [[0x10fb, 0x10fb], CharKind.Punctuation],
            [[0x1361, 0x1368], CharKind.Punctuation],
            [[0x166d, 0x166e], CharKind.Punctuation],
            [[0x169b, 0x169c], CharKind.Punctuation],
            [[0x16eb, 0x16ed], CharKind.Punctuation],
            [[0x1735, 0x1736], CharKind.Punctuation],
            [[0x17d4, 0x17dc], CharKind.Punctuation],
            [[0x1800, 0x180a], CharKind.Punctuation],
            [[0x200c, 0x2027], CharKind.Punctuation],
            [[0x202a, 0x202e], CharKind.Punctuation],
            [[0x2030, 0x205e], CharKind.Punctuation],
            [[0x2060, 0x27ff], CharKind.Punctuation],
            [[0x2070, 0x207f], CharKind.Superscript],
            [[0x2080, 0x2094], CharKind.Subscript],
            [[0x20a0, 0x27ff], CharKind.Punctuation],
            [[0x2800, 0x28ff], CharKind.Braille],
            [[0x2900, 0x2998], CharKind.Punctuation],
            [[0x29d8, 0x29db], CharKind.Punctuation],
            [[0x29fc, 0x29fd], CharKind.Punctuation],
            [[0x2e00, 0x2e7f], CharKind.Punctuation],
            [[0x3001, 0x3020], CharKind.Punctuation],
            [[0x3030, 0x3030], CharKind.Punctuation],
            [[0x303d, 0x303d], CharKind.Punctuation],
            [[0x3040, 0x309f], CharKind.Hiragana],
            [[0x30a0, 0x30ff], CharKind.Katakana],
            [[0x3300, 0x9fff], CharKind.Ideograph],
            [[0xac00, 0xd7a3], CharKind.Hangul],
            [[0xf900, 0xfaff], CharKind.Ideograph],
            [[0xfd3e, 0xfd3f], CharKind.Punctuation],
            [[0xfe30, 0xfe6b], CharKind.Punctuation],
            [[0xff00, 0xff0f], CharKind.Punctuation],
            [[0xff1a, 0xff20], CharKind.Punctuation],
            [[0xff3b, 0xff40], CharKind.Punctuation],
            [[0xff5b, 0xff65], CharKind.Punctuation],
            [[0x20000, 0x2a6df], CharKind.Ideograph],
            [[0x2a700, 0x2b73f], CharKind.Ideograph],
            [[0x2b740, 0x2b81f], CharKind.Ideograph],
            [[0x2f800, 0x2fa1f], CharKind.Ideograph],
        ];
        const codePointRangePatterns = [];
        for (let kind in CharKind) {
            if (!isNaN(Number(kind))) {
                codePointRangePatterns[kind] = [];
            }
        }
        for (let [[first, last], kind] of symbolTable) {
            if (first === last) {
                // '\u{hhhh}'
                codePointRangePatterns[kind].push(`\\u{${first.toString(16)}}`);
            }
            else {
                // '\u{hhhh}-\u{hhhh}'
                codePointRangePatterns[kind].push(`\\u{${first.toString(16)}}-\\u{${last.toString(16)}}`);
            }
        }
        // Symbols in vim.iskeyword or editor.wordSeparators
        // are treated as CharKind.Punctuation
        const escapedKeywordChars = _.escapeRegExp(keywordChars).replace(/-/g, '\\-');
        codePointRangePatterns[Number(CharKind.Punctuation)].push(escapedKeywordChars);
        const codePointRanges = codePointRangePatterns.map(patterns => patterns.join(''));
        const symbolSegments = codePointRanges.map(range => `([${range}]+)`);
        // wordSegment matches word characters.
        // A word character is a symbol which is neither
        // - space
        // - a symbol listed in the table
        // - a keyword (vim.iskeyword)
        const wordSegment = `([^\\s${codePointRanges.join('')}]+)`;
        // https://regex101.com/r/X1agK6/2
        const segments = symbolSegments.concat(wordSegment, '$^');
        const regexp = new RegExp(segments.join('|'), 'ug');
        return regexp;
    }
    static getAllPositions(line, regex) {
        let positions = [];
        let result = regex.exec(line);
        while (result) {
            positions.push(result.index);
            // Handles the case where an empty string match causes lastIndex not to advance,
            // which gets us in an infinite loop.
            if (result.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            result = regex.exec(line);
        }
        return positions;
    }
    getAllEndPositions(line, regex) {
        let positions = [];
        let result = regex.exec(line);
        while (result) {
            if (result[0].length) {
                positions.push(result.index + result[0].length - 1);
            }
            // Handles the case where an empty string match causes lastIndex not to advance,
            // which gets us in an infinite loop.
            if (result.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            result = regex.exec(line);
        }
        return positions;
    }
    static getWordLeftWithRegex(text, pos, regex, forceFirst = false, inclusive = false) {
        const positions = Position.getAllPositions(text, regex);
        return positions
            .reverse()
            .find(index => (index < pos && !inclusive) || (index <= pos && inclusive) || forceFirst);
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getWordLeftWithRegex(regex, inclusive = false) {
        for (let currentLine = this.line; currentLine >= 0; currentLine--) {
            const newCharacter = Position.getWordLeftWithRegex(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, this.character, regex, currentLine !== this.line, inclusive);
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter);
            }
        }
        return new Position(0, 0).getLineBegin();
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getWordRightWithRegex(regex, inclusive = false) {
        for (let currentLine = this.line; currentLine < textEditor_1.TextEditor.getLineCount(); currentLine++) {
            let positions = Position.getAllPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            let newCharacter = positions.find(index => (index > this.character && !inclusive) ||
                (index >= this.character && inclusive) ||
                currentLine !== this.line);
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter);
            }
        }
        return new Position(textEditor_1.TextEditor.getLineCount() - 1, 0).getLineEnd();
    }
    getLastWordEndWithRegex(regex) {
        for (let currentLine = this.line; currentLine > -1; currentLine--) {
            let positions = this.getAllEndPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            // if one line is empty, use the 0 position as the default value
            if (positions.length === 0) {
                positions.push(0);
            }
            // reverse the list to find the biggest element smaller than this.character
            positions = positions.reverse();
            let index = positions.findIndex(i => i < this.character || currentLine !== this.line);
            let newCharacter = 0;
            if (index === -1) {
                if (currentLine > -1) {
                    continue;
                }
                newCharacter = positions[positions.length - 1];
            }
            else {
                newCharacter = positions[index];
            }
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter);
            }
        }
        return new Position(0, 0).getLineBegin();
    }
    /**
     * Inclusive is true if we consider the current position a valid result, false otherwise.
     */
    getCurrentWordEndWithRegex(regex, inclusive) {
        for (let currentLine = this.line; currentLine < textEditor_1.TextEditor.getLineCount(); currentLine++) {
            let positions = this.getAllEndPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            let newCharacter = positions.find(index => (index > this.character && !inclusive) ||
                (index >= this.character && inclusive) ||
                currentLine !== this.line);
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter);
            }
        }
        return new Position(textEditor_1.TextEditor.getLineCount() - 1, 0).getLineEnd();
    }
    getPreviousSentenceBeginWithRegex(regex) {
        let paragraphBegin = this.getCurrentParagraphBeginning();
        for (let currentLine = this.line; currentLine >= paragraphBegin.line; currentLine--) {
            let endPositions = this.getAllEndPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            let newCharacter = endPositions.reverse().find(index => {
                const newPositionBeforeThis = new Position(currentLine, index)
                    .getRightThroughLineBreaks()
                    .compareTo(this);
                return newPositionBeforeThis && (index < this.character || currentLine < this.line);
            });
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter).getRightThroughLineBreaks();
            }
        }
        if (paragraphBegin.line + 1 === this.line || paragraphBegin.line === this.line) {
            return paragraphBegin;
        }
        else {
            return new Position(paragraphBegin.line + 1, 0);
        }
    }
    getNextSentenceBeginWithRegex(regex, inclusive) {
        // A paragraph and section boundary is also a sentence boundary.
        let paragraphEnd = this.getCurrentParagraphEnd();
        for (let currentLine = this.line; currentLine <= paragraphEnd.line; currentLine++) {
            let endPositions = this.getAllEndPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            let newCharacter = endPositions.find(index => (index > this.character && !inclusive) ||
                (index >= this.character && inclusive) ||
                currentLine !== this.line);
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter).getRightThroughLineBreaks();
            }
        }
        return this.getFirstNonWhitespaceInParagraph(paragraphEnd, inclusive);
    }
    getCurrentSentenceEndWithRegex(regex, inclusive) {
        let paragraphEnd = this.getCurrentParagraphEnd();
        for (let currentLine = this.line; currentLine <= paragraphEnd.line; currentLine++) {
            let allPositions = Position.getAllPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, regex);
            let newCharacter = allPositions.find(index => (index > this.character && !inclusive) ||
                (index >= this.character && inclusive) ||
                currentLine !== this.line);
            if (newCharacter !== undefined) {
                return new Position(currentLine, newCharacter);
            }
        }
        return this.getFirstNonWhitespaceInParagraph(paragraphEnd, inclusive);
    }
    getFirstNonWhitespaceInParagraph(paragraphEnd, inclusive) {
        // If the cursor is at an empty line, it's the end of a paragraph and the begin of another paragraph
        // Find the first non-whitepsace character.
        if (textEditor_1.TextEditor.getLineAt(new vscode.Position(this.line, 0)).text) {
            return paragraphEnd;
        }
        else {
            for (let currentLine = this.line; currentLine <= paragraphEnd.line; currentLine++) {
                const nonWhitePositions = Position.getAllPositions(textEditor_1.TextEditor.getLineAt(new vscode.Position(currentLine, 0)).text, /\S/g);
                const newCharacter = nonWhitePositions.find(index => (index > this.character && !inclusive) ||
                    (index >= this.character && inclusive) ||
                    currentLine !== this.line);
                if (newCharacter !== undefined) {
                    return new Position(currentLine, newCharacter);
                }
            }
        }
        throw new Error('This should never happen...');
    }
    findHelper(char, count, direction) {
        const line = textEditor_1.TextEditor.getLineAt(this);
        let index = this.character;
        while (count && index !== -1) {
            if (direction === 'forward') {
                index = line.text.indexOf(char, index + 1);
            }
            else {
                index = line.text.lastIndexOf(char, index - 1);
            }
            count--;
        }
        if (index > -1) {
            return new Position(this.line, index);
        }
        return undefined;
    }
    tilForwards(char, count = 1) {
        const position = this.findHelper(char, count, 'forward');
        if (!position) {
            return null;
        }
        return new Position(this.line, position.character - 1);
    }
    tilBackwards(char, count = 1) {
        const position = this.findHelper(char, count, 'backward');
        if (!position) {
            return null;
        }
        return new Position(this.line, position.character + 1);
    }
    findForwards(char, count = 1) {
        const position = this.findHelper(char, count, 'forward');
        if (!position) {
            return null;
        }
        return new Position(this.line, position.character);
    }
    findBackwards(char, count = 1) {
        const position = this.findHelper(char, count, 'backward');
        if (!position) {
            return null;
        }
        return position;
    }
}
exports.Position = Position;
Position.NonWordCharacters = configuration_1.configuration.iskeyword;
Position.NonBigWordCharacters = '';
Position.NonFileCharacters = '"\'`;<>{}[]()';
Position._nonWordCharRegex = Position.makeUnicodeWordRegex(Position.NonWordCharacters);
Position._nonBigWordCharRegex = Position.makeWordRegex(Position.NonBigWordCharacters);
Position._nonCamelCaseWordCharRegex = Position.makeCamelCaseWordRegex(Position.NonWordCharacters);
Position._sentenceEndRegex = /[\.!\?]{1}([ \n\t]+|$)/g;
Position._nonFileNameRegex = Position.makeWordRegex(Position.NonFileCharacters);

//# sourceMappingURL=position.js.map
