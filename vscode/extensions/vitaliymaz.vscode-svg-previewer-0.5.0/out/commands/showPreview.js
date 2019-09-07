"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("../utils");
const telemetry_1 = require("../telemetry");
function getShowPreviewEventProperties() {
    const showBoundingBox = vscode.workspace.getConfiguration('svg').get('preview.boundingBox');
    return {
        autoOpen: 'no',
        boundingBox: showBoundingBox ? 'yes' : 'no'
    };
}
class PreviewCommand {
    constructor(webviewManager, telemetryReporter) {
        this.webviewManager = webviewManager;
        this.telemetryReporter = telemetryReporter;
    }
    showPreview(webviewManager, uri, viewColumn) {
        if (utils_1.isSvgUri(uri)) {
            webviewManager.showPreview(uri, viewColumn);
        }
    }
    getActiveEditorUri() {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri;
    }
}
class ShowPreviewCommand extends PreviewCommand {
    constructor() {
        super(...arguments);
        this.id = 'svg.showPreview';
    }
    execute(uri) {
        const resource = uri || this.getActiveEditorUri();
        if (resource) {
            this.telemetryReporter.sendTelemetryEvent(telemetry_1.TelemetryEvents.TELEMETRY_EVENT_SHOW_PREVIEW, getShowPreviewEventProperties());
            this.showPreview(this.webviewManager, resource, vscode.ViewColumn.Active);
        }
    }
}
exports.ShowPreviewCommand = ShowPreviewCommand;
class ShowPreviewToSideCommand extends PreviewCommand {
    constructor() {
        super(...arguments);
        this.id = 'svg.showPreviewToSide';
    }
    execute(uri) {
        const resource = uri || this.getActiveEditorUri();
        if (resource) {
            this.telemetryReporter.sendTelemetryEvent(telemetry_1.TelemetryEvents.TELEMETRY_EVENT_SHOW_PREVIEW_TO_SIDE, getShowPreviewEventProperties());
            this.showPreview(this.webviewManager, resource, vscode.ViewColumn.Beside);
        }
    }
}
exports.ShowPreviewToSideCommand = ShowPreviewToSideCommand;
//# sourceMappingURL=showPreview.js.map