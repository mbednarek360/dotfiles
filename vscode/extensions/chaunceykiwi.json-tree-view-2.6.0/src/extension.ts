"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { JsonTreeViewProvider } from "./jsonTreeView";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const jsonTreeViewProvider = new JsonTreeViewProvider(context);
  vscode.window.registerTreeDataProvider("jsonTreeView", jsonTreeViewProvider);
  vscode.commands.registerCommand("jsonTreeView.refresh", () =>
    jsonTreeViewProvider.refresh()
  );
  vscode.commands.registerCommand("jsonTreeView.refreshNode", offset =>
    jsonTreeViewProvider.refresh(offset)
  );
  vscode.commands.registerCommand("jsonTreeView.revealNode", offset =>
    jsonTreeViewProvider.reveal(offset)
  );
  vscode.commands.registerCommand("jsonTreeView.revealNodeWithKey", offset =>
    jsonTreeViewProvider.revealWithKey(offset)
  );
  vscode.commands.registerCommand("extension.openJsonSelection", range =>
    jsonTreeViewProvider.select(range)
  );
  vscode.languages.onDidChangeDiagnostics(() => {
    jsonTreeViewProvider.refresh();
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
