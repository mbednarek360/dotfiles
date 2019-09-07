import * as json from "jsonc-parser";
import * as path from "path";
import * as vscode from "vscode";

export class JsonTreeViewProvider implements vscode.TreeDataProvider<number> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    number | null
  > = new vscode.EventEmitter<number | null>();
  readonly onDidChangeTreeData: vscode.Event<number | null> = this
    ._onDidChangeTreeData.event;

  private tree: json.Node;
  private text: string;
  private editor: vscode.TextEditor;
  private autoRefresh: boolean = true;
  private error_paths: (string | number)[][];

  constructor(private context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(() =>
      this.onActiveEditorChanged()
    );
    vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
    vscode.workspace.onDidSaveTextDocument(() => this.onDocumentSaved());
    vscode.workspace.onDidChangeConfiguration(() => {
      this.autoRefresh = vscode.workspace
        .getConfiguration("jsonTreeView")
        .get("autorefresh");
    });
    this.onActiveEditorChanged();
  }

  refresh(offset?: number): void {
    this.updateErrorPath();
    this.parseTree();
    if (offset) {
      this._onDidChangeTreeData.fire(offset);
    } else {
      this._onDidChangeTreeData.fire();
    }
  }

  reveal(offset: number): void {
    const path = json.getLocation(this.text, offset).path;
    let propertyNode = json.findNodeAtLocation(this.tree, path);
    const range = new vscode.Range(
      this.editor.document.positionAt(propertyNode.offset),
      this.editor.document.positionAt(propertyNode.offset + propertyNode.length)
    );

    this.editor.selection = new vscode.Selection(range.start, range.end);

    // Center the method in the document
    this.editor.revealRange(range);

    // Swap the focus to the editor
    vscode.window.showTextDocument(
      this.editor.document,
      this.editor.viewColumn,
      false
    );
  }

  revealWithKey(offset: number): void {
    const path = json.getLocation(this.text, offset).path;
    let propertyNode = json.findNodeAtLocation(this.tree, path);

    let inverseOffset = 0;
    if (propertyNode.parent.type !== "array") {
      let parentKeyLength = propertyNode.parent.children[0].value.length;
      inverseOffset = parentKeyLength + 4; // including 2("), 1(:), and 1 space
    }

    const range = new vscode.Range(
      this.editor.document.positionAt(propertyNode.offset - inverseOffset),
      this.editor.document.positionAt(propertyNode.offset + propertyNode.length)
    );

    this.editor.selection = new vscode.Selection(range.start, range.end);

    if (propertyNode.type !== "object") {
      // Center the method in the document
      this.editor.revealRange(range);
    }

    // Swap the focus to the editor
    vscode.window.showTextDocument(
      this.editor.document,
      this.editor.viewColumn,
      false
    );
  }

  private onActiveEditorChanged(): void {
    if (vscode.window.activeTextEditor) {
      if (vscode.window.activeTextEditor.document.uri.scheme === "file") {
        const enabled =
          vscode.window.activeTextEditor.document.languageId === "json" ||
          vscode.window.activeTextEditor.document.languageId === "jsonc";
        vscode.commands.executeCommand(
          "setContext",
          "jsonTreeViewEnabled",
          enabled
        );
        if (enabled) {
          this.refresh();
        }
      }
    } else {
      vscode.commands.executeCommand(
        "setContext",
        "jsonTreeViewEnabled",
        false
      );
    }
  }

  private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
    if (
      this.autoRefresh &&
      changeEvent.document.uri.toString() ===
        this.editor.document.uri.toString()
    ) {
      for (const change of changeEvent.contentChanges) {
        const path = json.getLocation(
          this.text,
          this.editor.document.offsetAt(change.range.start)
        ).path;
        path.pop();
        const node = path.length
          ? json.findNodeAtLocation(this.tree, path)
          : void 0;
        this.parseTree();
        this._onDidChangeTreeData.fire(node ? node.offset : void 0);
      }
    }
  }

  private onDocumentSaved(): void {
    this.refresh();
  }

  private parseTree(): void {
    this.text = "";
    this.tree = null;
    this.editor = vscode.window.activeTextEditor;
    if (this.editor && this.editor.document) {
      this.text = this.editor.document.getText();
      this.tree = json.parseTree(this.text);
    }
  }

  getChildren(offset?: number): Thenable<number[]> {
    if (offset) {
      const path = json.getLocation(this.text, offset).path;
      const node = json.findNodeAtLocation(this.tree, path);
      return Promise.resolve(this.getChildrenOffsets(node));
    } else {
      return Promise.resolve(
        this.tree ? this.getChildrenOffsets(this.tree) : []
      );
    }
  }

  private getChildrenOffsets(node: json.Node): number[] {
    const offsets: number[] = [];
    for (const child of node.children) {
      const childPath = json.getLocation(this.text, child.offset).path;
      const childNode = json.findNodeAtLocation(this.tree, childPath);
      if (childNode) {
        offsets.push(childNode.offset);
      }
    }
    return offsets;
  }

  getTreeItem(offset: number): vscode.TreeItem {
    const path = json.getLocation(this.text, offset).path;
    const valueNode = json.findNodeAtLocation(this.tree, path);
    if (valueNode) {
      let hasChildren =
        valueNode.type === "object" || valueNode.type === "array";
      let treeItem: vscode.TreeItem = new vscode.TreeItem(
        this.getLabel(valueNode),
        hasChildren
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None
      );

      if (!hasChildren) {
        treeItem.command = {
          command: "extension.openJsonSelection",
          title: "",
          arguments: [
            new vscode.Range(
              this.editor.document.positionAt(valueNode.offset),
              this.editor.document.positionAt(
                valueNode.offset + valueNode.length
              )
            )
          ]
        };
      }

      /* If tree item's path is in error paths, assign it an error icon */
      if (ifArrayAInArrayB(path, this.error_paths)) {
        treeItem.iconPath = this.getErrorIcon();
      } else {
        treeItem.iconPath = this.getIcon(valueNode);
      }

      treeItem.contextValue = valueNode.type;
      return treeItem;
    }
    return null;
  }

  select(range: vscode.Range) {
    this.editor.selection = new vscode.Selection(range.start, range.end);

    // Center the method in the document
    this.editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    // Swap the focus to the editor
    vscode.window.showTextDocument(
      this.editor.document,
      this.editor.viewColumn,
      false
    );
  }

  private getIcon(node: json.Node): any {
    let nodeType = node.type;
    if (nodeType === "boolean") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "boolean.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "boolean.svg")
        )
      };
    }
    if (nodeType === "string") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "string.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "string.svg")
        )
      };
    }
    if (nodeType === "number") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "number.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "number.svg")
        )
      };
    }

    if (nodeType === "object" || nodeType === "array") {
      return {
        light: this.context.asAbsolutePath(
          path.join("resources", "light", "list.svg")
        ),
        dark: this.context.asAbsolutePath(
          path.join("resources", "dark", "list.svg")
        )
      };
    }

    return null;
  }

  private getErrorIcon(): any {
    return {
      light: this.context.asAbsolutePath(
        path.join("resources", "light", "error.svg")
      ),
      dark: this.context.asAbsolutePath(
        path.join("resources", "dark", "error.svg")
      )
    };
  }

  private getLabel(node: json.Node): string {
    if (node.parent.type === "array") {
      let parentKey = node.parent.parent.children[0].value.toString();
      let config = vscode.workspace.getConfiguration().jsonTreeView;

      if (
        config.customizedViewActivated &&
        config.customizedViewMapping !== undefined &&
        parentKey in config.customizedViewMapping
      ) {
        let key: string = config.customizedViewMapping[parentKey];
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].children[0].value === key) {
            return node.children[i].children[1].value.toString();
          }
        }
      } else {
        let prefix =
          parentKey + " " + node.parent.children.indexOf(node).toString();

        if (node.type === "object") {
          return prefix;
        }
        if (node.type === "array") {
          return prefix + " [" + node.children.length + "]";
        }

        return node.value.toString();
      }
    } else {
      const property = node.parent.children[0].value.toString();
      if (node.type === "array" || node.type === "object") {
        if (node.type === "object") {
          return property;
        }
        if (node.type === "array") {
          return property + " [" + node.children.length + "]";
        }
      }
      const value = this.editor.document.getText(
        new vscode.Range(
          this.editor.document.positionAt(node.offset),
          this.editor.document.positionAt(node.offset + node.length)
        )
      );
      return `${property}: ${value}`;
    }
  }

  private updateErrorPath() {
    this.error_paths = [];

    let diagnostics = vscode.languages.getDiagnostics();
    for (let i = 0; i < diagnostics.length; i++) {
      if (
        diagnostics[i][0]["fsPath"] ===
        vscode.window.activeTextEditor.document.fileName
      ) {
        let error = diagnostics[i][1];
        this.error_paths = error.map(
          (x: any) =>
            json.getLocation(
              vscode.window.activeTextEditor.document.getText(),
              this.editor.document.offsetAt(x["range"]["end"])
            ).path
        );
      }
    }
  }
}

function ifArrayAInArrayB(A: (string | number)[], B: (string | number)[][]) {
  let A_flatten = A.map(x => x.toString()).join();
  let B_flatten = B.map(x => x.join());

  return withinOf(A_flatten, B_flatten);
}

function withinOf(A: string, B: string[]) {
  for (let i = 0; i < B.length; i++) {
    let A_array = A.split(",");
    let B_sub_array = B[i].split(",");

    /* return true if A_array is a sub array of B_sub_array */
    if (A_array.length <= B_sub_array.length) {
      let j;
      for (j = 0; j < A_array.length; j++) {
        if (A_array[j] !== B_sub_array[j]) {
          break;
        }
      }

      if (j === A_array.length) {
        return true;
      }
    }
  }

  return false;
}
