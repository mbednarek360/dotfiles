"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.sectionName = "graphvizPreview";
function getNullableConfiguration(name, defaultValue) {
    const configuration = vscode.workspace.getConfiguration(exports.sectionName);
    const value = configuration.get(name);
    return value ? value : defaultValue;
}
exports.getNullableConfiguration = getNullableConfiguration;
//# sourceMappingURL=configuration.js.map