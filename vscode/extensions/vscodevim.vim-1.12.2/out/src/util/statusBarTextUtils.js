"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mode_1 = require("../mode/mode");
const statusBar_1 = require("../statusBar");
const configuration_1 = require("../configuration/configuration");
/**
 * Shows the number of lines you just changed (with `dG`, for instance), if it
 * crosses a configured threshold.
 * @param numLinesChanged The number of lines changed
 */
function reportLinesChanged(numLinesChanged, vimState) {
    if (numLinesChanged > configuration_1.configuration.report) {
        statusBar_1.StatusBar.setText(vimState, `${numLinesChanged} more lines`);
    }
    else if (-numLinesChanged > configuration_1.configuration.report) {
        statusBar_1.StatusBar.setText(vimState, `${Math.abs(numLinesChanged)} fewer lines`);
    }
    else {
        statusBar_1.StatusBar.clear(vimState);
    }
}
exports.reportLinesChanged = reportLinesChanged;
/**
 * Shows the number of lines you just yanked, if it crosses a configured threshold.
 * @param numLinesYanked The number of lines yanked
 */
function reportLinesYanked(numLinesYanked, vimState) {
    if (numLinesYanked > configuration_1.configuration.report) {
        if (vimState.currentMode === mode_1.Mode.VisualBlock) {
            statusBar_1.StatusBar.setText(vimState, `block of ${numLinesYanked} lines yanked`);
        }
        else {
            statusBar_1.StatusBar.setText(vimState, `${numLinesYanked} lines yanked`);
        }
    }
    else {
        statusBar_1.StatusBar.clear(vimState);
    }
}
exports.reportLinesYanked = reportLinesYanked;
/**
 * Shows the active file's path and line count as well as position in the file as a percentage.
 * Triggered via `<C-g>` or `:f[ile]`.
 */
function reportFileInfo(position, vimState) {
    const doc = vimState.editor.document;
    const progress = Math.floor(((position.line + 1) / doc.lineCount) * 100);
    statusBar_1.StatusBar.setText(vimState, `"${doc.fileName}" ${doc.lineCount} lines --${progress}%--`);
}
exports.reportFileInfo = reportFileInfo;
/**
 * Shows the number of matches and current match index of a search.
 * @param matchIdx Index of current match, starting at 0
 * @param numMatches Total number of matches
 * @param vimState The current `VimState`
 */
function reportSearch(matchIdx, numMatches, vimState) {
    statusBar_1.StatusBar.setText(vimState, `match ${matchIdx + 1} of ${numMatches}`);
}
exports.reportSearch = reportSearch;

//# sourceMappingURL=statusBarTextUtils.js.map
