"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const commands = require("./commands");
/**
 * This method is called when the extension is activated.
 * @param context The extension context is a collection of utilities private to
 * the extension.
 */
function activate(context) {
    let run = vscode.commands.registerCommand('v.run', commands.run);
    let prod = vscode.commands.registerCommand('v.prod', commands.prod);
    let help = vscode.commands.registerCommand('v.help', commands.help);
    let ver = vscode.commands.registerCommand('v.ver', commands.ver);
    let path = vscode.commands.registerCommand('v.path', commands.path);
    let testFile = vscode.commands.registerCommand('v.test.file', commands.testFile);
    let testPackage = vscode.commands.registerCommand('v.test.package', commands.testPackage);
    let playground = vscode.commands.registerCommand('v.playground', commands.playground);
}
exports.activate = activate;
/**
 * This method is called when the extension is deactivated.
 */
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map