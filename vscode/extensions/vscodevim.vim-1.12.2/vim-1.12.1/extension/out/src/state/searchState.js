"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration_1 = require("../configuration/configuration");
const position_1 = require("./../common/motion/position");
const mode_1 = require("./../mode/mode");
const textEditor_1 = require("./../textEditor");
var SearchDirection;
(function (SearchDirection) {
    SearchDirection[SearchDirection["Forward"] = 1] = "Forward";
    SearchDirection[SearchDirection["Backward"] = -1] = "Backward";
})(SearchDirection = exports.SearchDirection || (exports.SearchDirection = {}));
/**
 * State involved with beginning a search (/).
 */
class SearchState {
    constructor(direction, startPosition, searchString = '', { isRegex = false } = {}, currentMode) {
        this.previousMode = mode_1.Mode.Normal;
        this._matchRanges = [];
        this._searchDirection = SearchDirection.Forward;
        this.needle = '';
        this._searchString = '';
        this._searchDirection = direction;
        this._searchCursorStartPosition = startPosition;
        this.isRegex = isRegex;
        this.searchString = searchString;
        this.previousMode = currentMode;
    }
    /**
     * Every range in the document that matches the search string.
     */
    get matchRanges() {
        return this._matchRanges;
    }
    get searchCursorStartPosition() {
        return this._searchCursorStartPosition;
    }
    get searchDirection() {
        return this._searchDirection;
    }
    get searchString() {
        return this._searchString;
    }
    set searchString(search) {
        if (this._searchString !== search) {
            this._searchString = search;
            const oldNeedle = this.needle;
            this.needle = search;
            this.offset = undefined;
            const needleSegments = this.searchDirection === SearchDirection.Backward
                ? search.split(SearchState.notEscapedQuestionMarkRegex)
                : search.split(SearchState.notEscapedSlashRegex);
            if (needleSegments.length > 1) {
                this.needle = needleSegments[0];
                const num = Number(needleSegments[1]);
                if (isNaN(num)) {
                    if (/b(\+-)?[0-9]*/.test(needleSegments[1])) {
                        this.offset = {
                            type: 'beginning',
                            num: Number(needleSegments[1].slice(1)),
                        };
                    }
                    else if (/e(\+-)?[0-9]*/.test(needleSegments[1])) {
                        this.offset = {
                            type: 'end',
                            num: Number(needleSegments[1].slice(1)),
                        };
                    }
                }
                else {
                    this.offset = {
                        type: 'line',
                        num: num,
                    };
                }
            }
            if (this.needle !== oldNeedle) {
                this._recalculateSearchRanges({ forceRecalc: true });
            }
        }
    }
    _recalculateSearchRanges({ forceRecalc } = {}) {
        const search = this.needle;
        if (search === '') {
            return;
        }
        // checking if the tab that is worked on has changed, or the file version has changed
        const shouldRecalculate = textEditor_1.TextEditor.isActive &&
            (this._cachedDocumentName !== textEditor_1.TextEditor.getDocumentName() ||
                this._cachedDocumentVersion !== textEditor_1.TextEditor.getDocumentVersion() ||
                forceRecalc);
        if (shouldRecalculate) {
            // Calculate and store all matching ranges
            this._cachedDocumentVersion = textEditor_1.TextEditor.getDocumentVersion();
            this._cachedDocumentName = textEditor_1.TextEditor.getDocumentName();
            this._matchRanges = [];
            /*
             * Decide whether the search is case sensitive.
             * If ignorecase is false, the search is case sensitive.
             * If ignorecase is true, the search should be case insensitive.
             * If both ignorecase and smartcase are true, the search is case sensitive only when the search string contains UpperCase character.
             */
            let ignorecase = configuration_1.configuration.ignorecase;
            if (ignorecase && configuration_1.configuration.smartcase && /[A-Z]/.test(search)) {
                ignorecase = false;
            }
            let ignorecaseOverride = search.match(SearchState.caseOverrideRegex);
            let searchRE = search;
            if (ignorecaseOverride) {
                // Vim strips all \c's but uses the behavior of the first one.
                searchRE = search.replace(SearchState.caseOverrideRegex, '');
                ignorecase = ignorecaseOverride[0][1] === 'c';
            }
            if (!this.isRegex) {
                searchRE = search.replace(SearchState.specialCharactersRegex, '\\$&');
            }
            const regexFlags = ignorecase ? 'gim' : 'gm';
            let regex;
            try {
                regex = new RegExp(searchRE, regexFlags);
            }
            catch (err) {
                // Couldn't compile the regexp, try again with special characters escaped
                searchRE = search.replace(SearchState.specialCharactersRegex, '\\$&');
                regex = new RegExp(searchRE, regexFlags);
            }
            // We store the entire text file as a string inside text, and run the
            // regex against it many times to find all of our matches. In order to
            // transform from the absolute position in the string to a Position
            // object, we store a prefix sum of the line lengths, and binary search
            // through it in order to find the current line and character.
            const finalPos = new position_1.Position(textEditor_1.TextEditor.getLineCount() - 1, 0).getLineEndIncludingEOL();
            const text = textEditor_1.TextEditor.getText(new vscode.Range(new position_1.Position(0, 0), finalPos));
            const lineLengths = text.split('\n').map(x => x.length + 1);
            let sumLineLengths = [];
            let curLength = 0;
            for (const length of lineLengths) {
                sumLineLengths.push(curLength);
                curLength += length;
            }
            const absPosToPosition = (val, l, r, arr) => {
                const mid = Math.floor((l + r) / 2);
                if (l === r - 1) {
                    return new position_1.Position(l, val - arr[mid]);
                }
                if (arr[mid] > val) {
                    return absPosToPosition(val, l, mid, arr);
                }
                else {
                    return absPosToPosition(val, mid, r, arr);
                }
            };
            const selection = vscode.window.activeTextEditor.selection;
            const startPos = sumLineLengths[Math.min(selection.start.line, selection.end.line)] +
                selection.active.character;
            regex.lastIndex = startPos;
            let result = regex.exec(text);
            let wrappedOver = false;
            do {
                if (this._matchRanges.length >= SearchState.MAX_SEARCH_RANGES) {
                    break;
                }
                // We need to wrap around to the back if we reach the end.
                if (!result && !wrappedOver) {
                    regex.lastIndex = 0;
                    wrappedOver = true;
                    result = regex.exec(text);
                }
                if (!result) {
                    break;
                }
                this._matchRanges.push(new vscode.Range(absPosToPosition(result.index, 0, sumLineLengths.length, sumLineLengths), absPosToPosition(result.index + result[0].length, 0, sumLineLengths.length, sumLineLengths)));
                if (result.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                result = regex.exec(text);
                if (!result && !wrappedOver) {
                    regex.lastIndex = 0;
                    wrappedOver = true;
                    result = regex.exec(text);
                }
            } while (result && !(wrappedOver && result.index >= startPos));
            this._matchRanges.sort((x, y) => x.start.line < y.start.line ||
                (x.start.line === y.start.line && x.start.character < y.start.character)
                ? -1
                : 1);
        }
    }
    /**
     * The position of the next search.
     * match == false if there is no match.
     *
     * Pass in -1 as direction to reverse the direction we search.
     */
    getNextSearchMatchPosition(startPosition, direction = 1) {
        const { start, end, match, index } = this.getNextSearchMatchRange(startPosition, direction);
        let pos = start;
        if (this.offset) {
            if (this.offset.type === 'line') {
                pos = start.add(position_1.PositionDiff.NewBOLDiff(this.offset.num));
            }
            else if (this.offset.type === 'beginning') {
                pos = start.getOffsetThroughLineBreaks(this.offset.num);
            }
            else if (this.offset.type === 'end') {
                pos = end.getOffsetThroughLineBreaks(this.offset.num - 1);
            }
        }
        return { pos, match, index };
    }
    /**
     * The position of the next search.
     * match == false if there is no match.
     *
     * Pass in -1 as direction to reverse the direction we search.
     *
     * end is exclusive; which means the index is start + matchedString.length
     */
    getNextSearchMatchRange(startPosition, direction = 1) {
        this._recalculateSearchRanges();
        if (this._matchRanges.length === 0) {
            // TODO(bell)
            return { start: startPosition, end: startPosition, match: false, index: -1 };
        }
        const effectiveDirection = direction * this._searchDirection;
        if (effectiveDirection === SearchDirection.Forward) {
            for (let [index, matchRange] of this._matchRanges.entries()) {
                if (matchRange.start.compareTo(startPosition) > 0) {
                    return {
                        start: position_1.Position.FromVSCodePosition(matchRange.start),
                        end: position_1.Position.FromVSCodePosition(matchRange.end),
                        match: true,
                        index,
                    };
                }
            }
            // Wrap around
            // TODO(bell)
            if (configuration_1.configuration.wrapscan) {
                const range = this._matchRanges[0];
                return {
                    start: position_1.Position.FromVSCodePosition(range.start),
                    end: position_1.Position.FromVSCodePosition(range.end),
                    match: true,
                    index: 0,
                };
            }
            else {
                return {
                    start: startPosition,
                    end: startPosition,
                    match: true,
                    index: this._matchRanges.length - 1,
                };
            }
        }
        else {
            for (let [index, matchRange] of this._matchRanges
                .slice(0)
                .reverse()
                .entries()) {
                if (matchRange.end.compareTo(startPosition) <= 0) {
                    return {
                        start: position_1.Position.FromVSCodePosition(matchRange.start),
                        end: position_1.Position.FromVSCodePosition(matchRange.end),
                        match: true,
                        index: this._matchRanges.length - index - 1,
                    };
                }
            }
            // Wrap around
            // TODO(bell)
            if (configuration_1.configuration.wrapscan) {
                const range = this._matchRanges[this._matchRanges.length - 1];
                return {
                    start: position_1.Position.FromVSCodePosition(range.start),
                    end: position_1.Position.FromVSCodePosition(range.end),
                    match: true,
                    index: this._matchRanges.length - 1,
                };
            }
            else {
                return {
                    start: startPosition,
                    end: startPosition,
                    match: true,
                    index: 0,
                };
            }
        }
    }
    getSearchMatchRangeOf(pos) {
        this._recalculateSearchRanges();
        if (this._matchRanges.length === 0) {
            // TODO(bell)
            return { start: pos, end: pos, match: false, index: -1 };
        }
        for (let [index, matchRange] of this._matchRanges.entries()) {
            if (matchRange.start.compareTo(pos) <= 0 && matchRange.end.compareTo(pos) > 0) {
                return {
                    start: position_1.Position.FromVSCodePosition(matchRange.start),
                    end: position_1.Position.FromVSCodePosition(matchRange.end),
                    match: true,
                    index,
                };
            }
        }
        // TODO(bell)
        return { start: pos, end: pos, match: false, index: -1 };
    }
}
exports.SearchState = SearchState;
SearchState.MAX_SEARCH_RANGES = 1000;
SearchState.specialCharactersRegex = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
SearchState.caseOverrideRegex = /\\[Cc]/g;
SearchState.notEscapedSlashRegex = /(?<=[^\\])\//g;
SearchState.notEscapedQuestionMarkRegex = /(?<=[^\\])\?/g;

//# sourceMappingURL=searchState.js.map
