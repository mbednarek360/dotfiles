"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
class SvgContentProvider {
    constructor(_extensionPath) {
        this._extensionPath = _extensionPath;
    }
    provideTextDocumentContent(uri) {
        const source = vscode.Uri.parse(uri.query);
        return vscode.workspace.openTextDocument(source)
            .then(document => this.getHtml(document, source));
    }
    getHtml(document, resource) {
        const base = `<base href="${this.getBaseUrl()}">`;
        const securityPolicy = `
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' vscode-resource: data:">
        `;
        const css = `<link rel="stylesheet" type="text/css" href="vscode-resource:styles.css">`;
        const scripts = `<script type="text/javascript" src="vscode-resource:index.js"></script>`;
        return `<!DOCTYPE html><html><head>${base}${securityPolicy}${css}</head><body>${scripts}</body></html>`;
    }
    getBaseUrl() {
        const mediaPath = vscode.Uri.file(path.join(this._extensionPath, 'media', '/'));
        return mediaPath.with({ scheme: 'vscode-resource' }).toString();
    }
}
exports.SvgContentProvider = SvgContentProvider;
//# sourceMappingURL=previewContentProvider.js.map