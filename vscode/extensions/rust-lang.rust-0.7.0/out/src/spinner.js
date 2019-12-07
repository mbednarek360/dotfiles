"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function startSpinner(prefix, postfix) {
    if (spinnerTimer != null) {
        clearInterval(spinnerTimer);
    }
    let state = 0;
    spinnerTimer = setInterval(() => {
        vscode_1.window.setStatusBarMessage(`${prefix} ${spinner[state]} ${postfix}`);
        state = (state + 1) % spinner.length;
    }, 100);
}
exports.startSpinner = startSpinner;
function stopSpinner(message) {
    if (spinnerTimer) {
        clearInterval(spinnerTimer);
    }
    spinnerTimer = null;
    vscode_1.window.setStatusBarMessage(message);
}
exports.stopSpinner = stopSpinner;
let spinnerTimer = null;
const spinner = ['◐', '◓', '◑', '◒'];
//# sourceMappingURL=spinner.js.map