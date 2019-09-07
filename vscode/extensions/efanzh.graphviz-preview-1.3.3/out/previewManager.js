"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const engines = require("./engines");
const messenger_1 = require("./messenger");
const scheduler_1 = require("./scheduler");
const previewType = "graphviz.preview";
class PreviewPort {
    constructor(view) {
        this.view = view;
    }
    send(message) {
        this.view.postMessage(message);
    }
    onReceive(handler) {
        this.view.onDidReceiveMessage(handler);
    }
}
function uriToVscodeResource(uri) {
    return uri.with({ scheme: "vscode-resource" }).toString(true);
}
class PreviewManager {
    constructor(context, template) {
        this.previewContexts = new WeakMap();
        this.previewDirUri = vscode.Uri.file(context.asAbsolutePath("out/preview"));
        this.previewContent = template.replace(/\{preview-dir\}/g, uriToVscodeResource(this.previewDirUri));
    }
    async showPreviewToSide(editor) {
        const document = editor.document;
        const context = this.previewContexts.get(document);
        if (context === undefined) {
            this.previewContexts.set(document, await this.createPreview(document, vscode.ViewColumn.Beside));
        }
        else {
            context.webviewPanel.reveal(undefined, true);
        }
    }
    async updatePreview(document) {
        const context = this.previewContexts.get(document);
        if (context !== undefined) {
            context.updatePreview();
        }
    }
    async exportImage(source, svgContent, workingDir) {
        const filePath = await vscode.window.showSaveDialog({
            filters: { "PDF": ["pdf"], "PNG Image": ["png"], "SVG Image": ["svg"] }
        });
        if (filePath) {
            await engines.currentEngine.saveToFile(source, svgContent, filePath.fsPath, workingDir);
        }
    }
    async createPreview(document, column) {
        const documentDir = path.dirname(document.fileName);
        const documentDirUri = vscode.Uri.file(documentDir);
        const localResourceRoots = [this.previewDirUri, documentDirUri];
        if (vscode.workspace.workspaceFolders) {
            localResourceRoots.push(...vscode.workspace.workspaceFolders.map((f) => f.uri));
        }
        const webviewPanel = vscode.window.createWebviewPanel(previewType, `Preview: ${path.basename(document.fileName)}`, {
            preserveFocus: true,
            viewColumn: column
        }, {
            enableScripts: true,
            localResourceRoots,
            retainContextWhenHidden: true
        });
        webviewPanel.webview.html = this.previewContent.replace(/\{base-url\}/g, uriToVscodeResource(documentDirUri));
        // Add bindings.
        const messenger = messenger_1.createMessenger(new PreviewPort(webviewPanel.webview), async (message) => {
            switch (message.type) {
                case "export":
                    try {
                        await this.exportImage(document.getText(), message.image, documentDir);
                    }
                    catch (error) {
                        await vscode.window.showErrorMessage(error.message);
                    }
                    break;
            }
        });
        const scheduler = scheduler_1.createScheduler((cancel, source) => engines.currentEngine.renderToSvg(source, documentDir, cancel), (image) => messenger({
            image,
            type: "success"
        }), (error) => messenger({
            message: error.message,
            type: "failure"
        }));
        // Add event handlers.
        const updatePreview = () => scheduler(document.getText());
        webviewPanel.onDidDispose(() => this.previewContexts.delete(document));
        webviewPanel.onDidChangeViewState((e) => {
            if (e.webviewPanel.visible) {
                updatePreview();
            }
        });
        // Initialize.
        await messenger({ type: "initialize" });
        updatePreview();
        // Return context.
        return { webviewPanel, updatePreview };
    }
}
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=previewManager.js.map