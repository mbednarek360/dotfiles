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
const path = require("path");
const nls = require("vscode-nls");
const utils_1 = require("../utils");
const webViewMessaging_1 = require("../webViewMessaging");
const localize = nls.loadMessageBundle();
class Preview {
    constructor(_resource, _panel, _extensionPath, telemetryReporter) {
        this._resource = _resource;
        this._panel = _panel;
        this._extensionPath = _extensionPath;
        this.telemetryReporter = telemetryReporter;
        this._onDisposeEmitter = new vscode.EventEmitter();
        this.onDispose = this._onDisposeEmitter.event;
        this._onDidChangeViewStateEmitter = new vscode.EventEmitter();
        this.onDidChangeViewState = this._onDidChangeViewStateEmitter.event;
        this.setPanelIcon();
        this._panel.onDidChangeViewState((event) => {
            this._onDidChangeViewStateEmitter.fire(event);
            if (event.webviewPanel.visible && this._postponedMessage) {
                this.postMessage(this._postponedMessage);
                delete this._postponedMessage;
            }
        });
        this._panel.onDidDispose(() => {
            this._onDisposeEmitter.fire();
            this.dispose();
        });
        this._panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'sendTelemetryEvent') {
                this.telemetryReporter.sendTelemetryEvent(message.payload.eventName, message.payload.properties);
            }
        });
    }
    static create(source, viewColumn, extensionPath, telemetryReporter) {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = vscode.window.createWebviewPanel(Preview.contentProviderKey, Preview.getPreviewTitle(source.path), viewColumn, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
            });
            const doc = yield vscode.workspace.openTextDocument(utils_1.withSvgPreviewSchemaUri(source));
            panel.webview.html = doc.getText();
            return new Preview(source, panel, extensionPath, telemetryReporter);
        });
    }
    static revive(source, panel, extensionPath, telemetryReporter) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield vscode.workspace.openTextDocument(utils_1.withSvgPreviewSchemaUri(source));
            panel.webview.html = doc.getText();
            return new Preview(source, panel, extensionPath, telemetryReporter);
        });
    }
    static getPreviewTitle(path) {
        return localize('svg.preview.panel.title', 'Preview {0}', path.replace(/^.*[\\\/]/, ''));
    }
    get source() {
        return this._resource;
    }
    get panel() {
        return this._panel;
    }
    update(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resource) {
                this._resource = resource;
            }
            this._panel.title = Preview.getPreviewTitle(this._resource.fsPath);
            const message = yield this.getUpdateWebViewMessage(this._resource);
            this.postMessage(message);
        });
    }
    dispose() {
        this._panel.dispose();
    }
    postMessage(message) {
        if (this._panel.visible) {
            this._panel.webview.postMessage(message);
        }
        else {
            // It is not possible posting messages to hidden web views
            // So saving the last update and flush it once panel become visible
            this._postponedMessage = message;
        }
    }
    getUpdateWebViewMessage(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(uri);
            const showBoundingBox = vscode.workspace.getConfiguration('svg').get('preview.boundingBox');
            return webViewMessaging_1.updatePreview({
                uri: uri.toString(),
                data: document.getText(),
                settings: { showBoundingBox }
            });
        });
    }
    setPanelIcon() {
        const root = path.join(this._extensionPath, 'media');
        this._panel.iconPath = {
            light: vscode.Uri.file(path.join(root, 'Preview.svg')),
            dark: vscode.Uri.file(path.join(root, 'Preview_inverse.svg'))
        };
    }
}
Preview.contentProviderKey = 'svg-preview';
exports.Preview = Preview;
//# sourceMappingURL=preview.js.map