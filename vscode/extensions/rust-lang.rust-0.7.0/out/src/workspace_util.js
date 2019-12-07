"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
// searches up the folder structure until it finds a Cargo.toml
function nearestParentWorkspace(curWorkspace, filePath) {
    // check that the workspace folder already contains the "Cargo.toml"
    const workspaceRoot = path.parse(curWorkspace.uri.fsPath).dir;
    const rootManifest = path.join(workspaceRoot, 'Cargo.toml');
    if (fs.existsSync(rootManifest)) {
        return curWorkspace;
    }
    // algorithm that will strip one folder at a time and check if that folder contains "Cargo.toml"
    let current = filePath;
    while (true) {
        const old = current;
        current = path.dirname(current);
        // break in case there is a bug that could result in a busy loop
        if (old === current) {
            break;
        }
        // break in case the strip folder has not changed
        if (workspaceRoot === path.parse(current).dir) {
            break;
        }
        // check if "Cargo.toml" is present in the parent folder
        const cargoPath = path.join(current, 'Cargo.toml');
        if (fs.existsSync(cargoPath)) {
            // ghetto change the uri on Workspace folder to make vscode think it's located elsewhere
            return Object.assign({}, curWorkspace, { uri: vscode_1.Uri.parse(current) });
        }
    }
    return curWorkspace;
}
exports.nearestParentWorkspace = nearestParentWorkspace;
//# sourceMappingURL=workspace_util.js.map