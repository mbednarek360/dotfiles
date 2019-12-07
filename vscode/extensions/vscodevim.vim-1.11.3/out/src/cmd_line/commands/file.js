"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util = require("util");
const vscode = require("vscode");
const logger_1 = require("../../util/logger");
const path_1 = require("../../util/path");
const node = require("../node");
const untildify = require("untildify");
function doesFileExist(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            try {
                yield vscode.workspace.fs.stat(fileUri);
                return true;
            }
            catch (_a) {
                return false;
            }
        }
        else {
            // fallback to local fs
            const fsExists = util.promisify(fs.exists);
            return fsExists(fileUri.fsPath);
        }
    });
}
var FilePosition;
(function (FilePosition) {
    FilePosition[FilePosition["NewWindowVerticalSplit"] = 0] = "NewWindowVerticalSplit";
    FilePosition[FilePosition["NewWindowHorizontalSplit"] = 1] = "NewWindowHorizontalSplit";
})(FilePosition = exports.FilePosition || (exports.FilePosition = {}));
class FileCommand extends node.CommandBase {
    constructor(args) {
        super();
        this._logger = logger_1.Logger.get('File');
        this._name = 'file';
        this._arguments = args;
    }
    get arguments() {
        return this._arguments;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.arguments.bang) {
                yield vscode.commands.executeCommand('workbench.action.files.revert');
                return;
            }
            // Need to do this before the split since it loses the activeTextEditor
            const editorFileUri = vscode.window.activeTextEditor.document.uri;
            let editorFilePath = editorFileUri.fsPath;
            // Do the split if requested
            let split = false;
            if (this.arguments.position === FilePosition.NewWindowVerticalSplit) {
                yield vscode.commands.executeCommand('workbench.action.splitEditorRight');
                split = true;
            }
            if (this.arguments.position === FilePosition.NewWindowHorizontalSplit) {
                yield vscode.commands.executeCommand('workbench.action.splitEditorDown');
                split = true;
            }
            let hidePreviousEditor = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (split === true) {
                        yield vscode.commands.executeCommand('workbench.action.previousEditor');
                        yield vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                    }
                });
            };
            // No name was specified
            if (this.arguments.name === undefined) {
                if (this.arguments.createFileIfNotExists === true) {
                    yield vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
                    yield hidePreviousEditor();
                }
                return;
            }
            // Only untidify when the currently open page and file completion is local
            if (this.arguments.name && editorFileUri.scheme === 'file') {
                this._arguments.name = untildify(this.arguments.name);
            }
            let fileUri = editorFileUri;
            // Using the empty string will request to open a file
            if (this.arguments.name === '') {
                // No name on split is fine and just return
                if (split === true) {
                    return;
                }
                const fileList = yield vscode.window.showOpenDialog({});
                if (fileList && fileList.length > 0) {
                    fileUri = fileList[0];
                }
            }
            else {
                // remove file://
                this._arguments.name = this.arguments.name.replace(/^file:\/\//, '');
                // Using a filename, open or create the file
                const isRemote = !!vscode.env.remoteName;
                const { fullPath, path: p } = path_1.getPathDetails(this.arguments.name, editorFileUri, isRemote);
                // Only if the expanded path of the full path is different than
                // the currently opened window path
                if (fullPath !== editorFilePath) {
                    const uriPath = path_1.resolveUri(fullPath, p.sep, editorFileUri, isRemote);
                    if (uriPath === null) {
                        // return if the path is invalid
                        return;
                    }
                    let fileExists = yield doesFileExist(uriPath);
                    if (fileExists) {
                        // If the file without the added ext exists
                        fileUri = uriPath;
                    }
                    else {
                        // if file does not exist
                        // try to find it with the same extension as the current file
                        const pathWithExt = fullPath + p.extname(editorFilePath);
                        const uriPathWithExt = path_1.resolveUri(pathWithExt, p.sep, editorFileUri, isRemote);
                        if (uriPathWithExt !== null) {
                            fileExists = yield doesFileExist(uriPathWithExt);
                            if (fileExists) {
                                // if the file with the added ext exists
                                fileUri = uriPathWithExt;
                            }
                        }
                    }
                    // If both with and without ext path do not exist
                    if (!fileExists) {
                        if (this.arguments.createFileIfNotExists) {
                            // Change the scheme to untitled to open an
                            // untitled tab
                            fileUri = uriPath.with({ scheme: 'untitled' });
                        }
                        else {
                            this._logger.error(`${this.arguments.name} does not exist.`);
                            return;
                        }
                    }
                }
            }
            const doc = yield vscode.workspace.openTextDocument(fileUri);
            vscode.window.showTextDocument(doc);
            if (this.arguments.lineNumber) {
                vscode.window.activeTextEditor.revealRange(new vscode.Range(new vscode.Position(this.arguments.lineNumber, 0), new vscode.Position(this.arguments.lineNumber, 0)));
            }
            yield hidePreviousEditor();
        });
    }
}
exports.FileCommand = FileCommand;

//# sourceMappingURL=file.js.map
