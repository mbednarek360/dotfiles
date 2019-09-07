"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const previewContentProvider_1 = require("./features/previewContentProvider");
const previewManager_1 = require("./features/previewManager");
const commandManager_1 = require("./commandManager");
const commands = require("./commands");
const telemetry_1 = require("./telemetry");
let telemetryReporter;
function activate(context) {
    telemetryReporter = telemetry_1.createTelemetryReporter();
    telemetryReporter.sendTelemetryEvent(telemetry_1.TelemetryEvents.TELEMETRY_EVENT_ACTIVATION);
    const contentProvider = new previewContentProvider_1.SvgContentProvider(context.extensionPath);
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('svg-preview', contentProvider));
    const previewManager = new previewManager_1.PreviewManager(context.extensionPath, telemetryReporter);
    vscode.window.registerWebviewPanelSerializer('svg-preview', previewManager);
    const commandManager = new commandManager_1.CommandManager();
    context.subscriptions.push(commandManager);
    commandManager.register(new commands.ShowPreviewToSideCommand(previewManager, telemetryReporter));
    commandManager.register(new commands.ShowPreviewCommand(previewManager, telemetryReporter));
    commandManager.register(new commands.ShowSourceCommand(previewManager, telemetryReporter));
}
exports.activate = activate;
function deactivate() {
    telemetryReporter.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map