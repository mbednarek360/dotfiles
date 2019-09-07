"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("../utils");
const preview_1 = require("./preview");
const telemetry_1 = require("../telemetry");
class PreviewManager {
    constructor(_extensionPath, telemetryReporter) {
        this._extensionPath = _extensionPath;
        this.telemetryReporter = telemetryReporter;
        this._disposables = [];
        this._previews = [];
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument.bind(this), null, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this), null, this._disposables);
        // check the need to open auto preview on plugin activation,
        // as vscode.window.onDidChangeActiveTextEditor is not yet registered before the first .svg opened
        if (vscode.window.activeTextEditor && this.shouldAutoOpenPreviewForEditor(vscode.window.activeTextEditor)) {
            this.logAutoOpenPreviewEvent();
            this.showPreview(vscode.window.activeTextEditor.document.uri, vscode.ViewColumn.Beside);
        }
    }
    showPreview(uri, viewColumn) {
        return __awaiter(this, void 0, void 0, function* () {
            const preview = this.getPreviewOnTargetColumn(viewColumn) || (yield this.createPreview(uri, viewColumn));
            preview.update(uri);
            preview.panel.reveal(preview.panel.viewColumn);
        });
    }
    showSource() {
        vscode.workspace.openTextDocument(this._activePreview.source)
            .then(document => vscode.window.showTextDocument(document));
    }
    deserializeWebviewPanel(webview, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = vscode.Uri.parse(state.uri);
            const preview = yield preview_1.Preview.revive(source, webview, this._extensionPath, this.telemetryReporter);
            this.registerPreview(preview);
            preview.update();
        });
    }
    dispose() {
        this._disposables.forEach(ds => ds.dispose());
        this._previews.forEach(ds => ds.dispose());
    }
    isActivePreviewUri(uri) {
        return this._activePreview && this._activePreview.source.toString() === uri.toString();
    }
    onDidChangeActiveTextEditor(editor) {
        if (!editor) {
            return;
        }
        if (utils_1.isSvgUri(editor.document.uri) && !this.isActivePreviewUri(editor.document.uri)) {
            this._previews.forEach(preview => {
                preview.update(editor.document.uri);
            });
        }
        if (this.shouldAutoOpenPreviewForEditor(editor)) {
            this.logAutoOpenPreviewEvent();
            this.showPreview(editor.document.uri, vscode.ViewColumn.Beside);
        }
    }
    onDidChangeTextDocument(event) {
        const preview = this.getPreviewOf(event.document.uri);
        if (preview) {
            preview.update();
        }
    }
    createPreview(uri, viewColumn) {
        return __awaiter(this, void 0, void 0, function* () {
            const preview = yield preview_1.Preview.create(uri, viewColumn, this._extensionPath, this.telemetryReporter);
            this.registerPreview(preview);
            return preview;
        });
    }
    registerPreview(preview) {
        this._previews.push(preview);
        this.onPreviewFocus(preview);
        preview.onDispose(() => {
            this.onPreviewBlur();
            this._previews.splice(this._previews.indexOf(preview), 1);
        });
        preview.onDidChangeViewState(({ webviewPanel }) => {
            webviewPanel.active ? this.onPreviewFocus(preview) : this.onPreviewBlur();
        });
    }
    onPreviewFocus(preview) {
        this._activePreview = preview;
        this.setSvgPreviewFocusContext(true);
    }
    onPreviewBlur() {
        this._activePreview = undefined;
        this.setSvgPreviewFocusContext(false);
    }
    setSvgPreviewFocusContext(value) {
        vscode.commands.executeCommand('setContext', PreviewManager.svgPreviewFocusContextKey, value);
    }
    getPreviewOnTargetColumn(viewColumn) {
        const activeViewColumn = vscode.window.activeTextEditor ?
            vscode.window.activeTextEditor.viewColumn : vscode.ViewColumn.Active;
        return viewColumn === vscode.ViewColumn.Active ?
            this._previews.find(preview => preview.panel.viewColumn === activeViewColumn) :
            this._previews.find(preview => preview.panel.viewColumn === activeViewColumn + 1);
    }
    getPreviewOf(resource) {
        return this._previews.find(p => p.source.fsPath === resource.fsPath);
    }
    shouldAutoOpenPreviewForEditor(editor) {
        const isAutoOpen = vscode.workspace.getConfiguration('svg').get('preview.autoOpen');
        return isAutoOpen && utils_1.isSvgUri(editor.document.uri) && !this.getPreviewOf(editor.document.uri);
    }
    logAutoOpenPreviewEvent() {
        const showBoundingBox = vscode.workspace.getConfiguration('svg').get('preview.boundingBox');
        this.telemetryReporter.sendTelemetryEvent(telemetry_1.TelemetryEvents.TELEMETRY_EVENT_SHOW_PREVIEW_TO_SIDE, { autoOpen: 'yes', boundingBox: showBoundingBox ? 'yes' : 'no' });
    }
}
PreviewManager.svgPreviewFocusContextKey = 'svgPreviewFocus';
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=previewManager.js.map