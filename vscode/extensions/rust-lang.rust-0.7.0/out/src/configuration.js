"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const rustup_1 = require("./rustup");
function fromStringToRevealOutputChannelOn(value) {
    switch (value && value.toLowerCase()) {
        case 'info':
            return vscode_languageclient_1.RevealOutputChannelOn.Info;
        case 'warn':
            return vscode_languageclient_1.RevealOutputChannelOn.Warn;
        case 'error':
            return vscode_languageclient_1.RevealOutputChannelOn.Error;
        case 'never':
        default:
            return vscode_languageclient_1.RevealOutputChannelOn.Never;
    }
}
class RLSConfiguration {
    constructor(configuration, wsPath) {
        this.configuration = configuration;
        this.wsPath = wsPath;
        if (this.configuration.get('rust-client.useWSL')) {
            vscode_1.window.showWarningMessage('Option `rust-client.useWsl` is enabled for this workspace, which is DEPRECATED.\
        For a complete and first-class WSL support try Remote - WSL extension \
        extension (https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)');
        }
    }
    static loadFromWorkspace(wsPath) {
        const configuration = vscode_1.workspace.getConfiguration();
        return new RLSConfiguration(configuration, wsPath);
    }
    static readRevealOutputChannelOn(configuration) {
        const setting = configuration.get('rust-client.revealOutputChannelOn', 'never');
        return fromStringToRevealOutputChannelOn(setting);
    }
    /**
     * Tries to fetch the `rust-client.channel` configuration value. If missing,
     * falls back on active toolchain specified by rustup (at `rustupPath`),
     * finally defaulting to `nightly` if all fails.
     */
    static readChannel(wsPath, rustupConfiguration, configuration) {
        const channel = configuration.get('rust-client.channel');
        if (channel) {
            return channel;
        }
        else {
            try {
                return rustup_1.getActiveChannel(wsPath, rustupConfiguration);
            }
            catch (e) {
                // rustup might not be installed at the time the configuration is
                // initially loaded, so silently ignore the error and return a default value
                return 'nightly';
            }
        }
    }
    get rustupPath() {
        return this.configuration.get('rust-client.rustupPath', 'rustup');
    }
    get useWSL() {
        return this.configuration.get('rust-client.useWSL', false);
    }
    get logToFile() {
        return this.configuration.get('rust-client.logToFile', false);
    }
    get rustupDisabled() {
        const rlsOverriden = Boolean(this.rlsPath);
        return (rlsOverriden ||
            this.configuration.get('rust-client.disableRustup', false));
    }
    get revealOutputChannelOn() {
        return RLSConfiguration.readRevealOutputChannelOn(this.configuration);
    }
    get updateOnStartup() {
        return this.configuration.get('rust-client.updateOnStartup', true);
    }
    get channel() {
        return RLSConfiguration.readChannel(this.wsPath, this.rustupConfig(true), this.configuration);
    }
    /**
     * If specified, RLS will be spawned by executing a file at the given path.
     */
    get rlsPath() {
        return this.configuration.get('rust-client.rlsPath');
    }
    get multiProjectEnabled() {
        return this.configuration.get('rust-client.enableMultiProjectSetup', false);
    }
    // Added ignoreChannel for readChannel function. Otherwise we end in an infinite loop.
    rustupConfig(ignoreChannel = false) {
        return {
            channel: ignoreChannel ? '' : this.channel,
            path: this.rustupPath,
            useWSL: this.useWSL,
        };
    }
}
exports.RLSConfiguration = RLSConfiguration;
//# sourceMappingURL=configuration.js.map