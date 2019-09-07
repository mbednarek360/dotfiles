"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration = require("./configuration");
const engines = require("./engines");
const previewManager_1 = require("./previewManager");
const utilities = require("./utilities");
const previewCommand = "graphviz.showPreviewToSide";
// Extension interfaces.
async function activate(context) {
    const previewHtml = await utilities.readFileAsync(context.asAbsolutePath("resources/preview.html"), "utf8");
    const previewManager = new previewManager_1.PreviewManager(context, previewHtml);
    context.subscriptions.push(vscode.commands.registerCommand(previewCommand, () => {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor !== undefined) {
            previewManager.showPreviewToSide(activeTextEditor);
        }
    }), vscode.workspace.onDidChangeTextDocument((e) => previewManager.updatePreview(e.document)), vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(configuration.sectionName)) {
            engines.updateConfiguration();
        }
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map