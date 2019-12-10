"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const mode_1 = require("./mode/mode");
const configuration_1 = require("./configuration/configuration");
class StatusBarImpl {
    constructor() {
        this._previousModeName = undefined;
        this._showingDefaultMessage = true;
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_SAFE_INTEGER // Furthest right on the left
        );
        this._statusBarItem.show();
        this._recordedStateStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MAX_SAFE_INTEGER // Furthest left on the right
        );
        this._recordedStateStatusBarItem.show();
    }
    dispose() {
        this._statusBarItem.dispose();
        this._recordedStateStatusBarItem.dispose();
    }
    /**
     * Updates the status bar text
     * @param isError If true, text rendered in red
     */
    setText(vimState, text, isError = false) {
        const hasModeChanged = vimState.currentMode !== this._previousModeName;
        // Text
        this.updateText(text);
        // Foreground color
        if (!configuration_1.configuration.statusBarColorControl) {
            this._statusBarItem.color = isError ? new vscode.ThemeColor('errorForeground') : undefined;
        }
        // Background color
        const shouldUpdateColor = configuration_1.configuration.statusBarColorControl && hasModeChanged;
        if (shouldUpdateColor) {
            this.updateColor(vimState.currentMode);
        }
        this._previousModeName = vimState.currentMode;
        this._showingDefaultMessage = false;
    }
    getText() {
        return this._statusBarItem.text.replace(/\^M/g, '\n');
    }
    /**
     * Clears any messages from the status bar, leaving the default info, such as
     * the current mode and macro being recorded.
     * @param force If true, will clear even high priority messages like errors.
     */
    clear(vimState, force = true) {
        if (!this._showingDefaultMessage && !force) {
            return;
        }
        let text = [];
        if (configuration_1.configuration.showmodename) {
            text.push(mode_1.statusBarText(vimState));
            if (vimState.isMultiCursor) {
                text.push(' MULTI CURSOR ');
            }
        }
        if (configuration_1.configuration.showcmd) {
            this._recordedStateStatusBarItem.text = mode_1.statusBarCommandText(vimState);
        }
        if (vimState.isRecordingMacro) {
            const macroText = 'Recording @' + vimState.recordedMacro.registerName;
            text.push(macroText);
        }
        exports.StatusBar.setText(vimState, text.join(' '));
        this._showingDefaultMessage = true;
    }
    updateText(text) {
        const escaped = text.replace(/\n/g, '^M');
        this._statusBarItem.text = escaped || '';
    }
    updateColor(mode) {
        let foreground = undefined;
        let background = undefined;
        let colorToSet = configuration_1.configuration.statusBarColors[mode_1.Mode[mode].toLowerCase()];
        if (colorToSet !== undefined) {
            if (typeof colorToSet === 'string') {
                background = colorToSet;
            }
            else {
                [background, foreground] = colorToSet;
            }
        }
        const workbenchConfiguration = configuration_1.configuration.getConfiguration('workbench');
        const currentColorCustomizations = workbenchConfiguration.get('colorCustomizations');
        const colorCustomizations = Object.assign({}, currentColorCustomizations || {}, {
            'statusBar.background': `${background}`,
            'statusBar.noFolderBackground': `${background}`,
            'statusBar.debuggingBackground': `${background}`,
            'statusBar.foreground': `${foreground}`,
        });
        // If colors are undefined, return to VSCode defaults
        if (background === undefined) {
            delete colorCustomizations['statusBar.background'];
            delete colorCustomizations['statusBar.noFolderBackground'];
            delete colorCustomizations['statusBar.debuggingBackground'];
        }
        if (foreground === undefined) {
            delete colorCustomizations['statusBar.foreground'];
        }
        if (currentColorCustomizations !== colorCustomizations) {
            workbenchConfiguration.update('colorCustomizations', colorCustomizations, true);
        }
    }
}
exports.StatusBar = new StatusBarImpl();

//# sourceMappingURL=statusBar.js.map
