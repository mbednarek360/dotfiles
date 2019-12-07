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
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const configuration_1 = require("./configuration");
const signatureHelpProvider_1 = require("./providers/signatureHelpProvider");
const rustup_1 = require("./rustup");
const spinner_1 = require("./spinner");
const tasks_1 = require("./tasks");
const child_process_1 = require("./utils/child_process");
const wslpath_1 = require("./utils/wslpath");
const workspace_util = require("./workspace_util");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.subscriptions.push(configureLanguage());
        vscode_1.workspace.onDidOpenTextDocument(doc => whenOpeningTextDocument(doc, context));
        vscode_1.workspace.textDocuments.forEach(doc => whenOpeningTextDocument(doc, context));
        vscode_1.workspace.onDidChangeWorkspaceFolders(e => whenChangingWorkspaceFolders(e, context));
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all([...workspaces.values()].map(ws => ws.stop()));
    });
}
exports.deactivate = deactivate;
// Taken from https://github.com/Microsoft/vscode-extension-samples/blob/master/lsp-multi-server-sample/client/src/extension.ts
function whenOpeningTextDocument(document, context) {
    if (document.languageId !== 'rust' && document.languageId !== 'toml') {
        return;
    }
    const uri = document.uri;
    let folder = vscode_1.workspace.getWorkspaceFolder(uri);
    if (!folder) {
        return;
    }
    const inMultiProjectMode = vscode_1.workspace
        .getConfiguration()
        .get('rust-client.enableMultiProjectSetup', false);
    const inNestedOuterProjectMode = vscode_1.workspace
        .getConfiguration()
        .get('rust-client.nestedMultiRootConfigInOutermost', true);
    if (inMultiProjectMode) {
        folder = workspace_util.nearestParentWorkspace(folder, document.uri.fsPath);
    }
    else if (inNestedOuterProjectMode) {
        folder = getOuterMostWorkspaceFolder(folder);
    }
    if (!folder) {
        spinner_1.stopSpinner(`RLS: Cargo.toml missing`);
        return;
    }
    const folderPath = folder.uri.toString();
    if (!workspaces.has(folderPath)) {
        const workspace = new ClientWorkspace(folder);
        activeWorkspace = workspace;
        workspaces.set(folderPath, workspace);
        workspace.start(context);
    }
    else {
        const ws = workspaces.get(folderPath);
        activeWorkspace = typeof ws === 'undefined' ? null : ws;
    }
}
// This is an intermediate, lazy cache used by `getOuterMostWorkspaceFolder`
// and cleared when VSCode workspaces change.
let _sortedWorkspaceFolders;
function sortedWorkspaceFolders() {
    // TODO: decouple the global state such that it can be moved to workspace_util
    if (!_sortedWorkspaceFolders && vscode_1.workspace.workspaceFolders) {
        _sortedWorkspaceFolders = vscode_1.workspace.workspaceFolders
            .map(folder => {
            let result = folder.uri.toString();
            if (result.charAt(result.length - 1) !== '/') {
                result = result + '/';
            }
            return result;
        })
            .sort((a, b) => {
            return a.length - b.length;
        });
    }
    return _sortedWorkspaceFolders || [];
}
function getOuterMostWorkspaceFolder(folder) {
    // TODO: decouple the global state such that it can be moved to workspace_util
    const sorted = sortedWorkspaceFolders();
    for (const element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== '/') {
            uri = uri + '/';
        }
        if (uri.startsWith(element)) {
            return vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.parse(element)) || folder;
        }
    }
    return folder;
}
function whenChangingWorkspaceFolders(e, context) {
    _sortedWorkspaceFolders = undefined;
    // If a VSCode workspace has been added, check to see if it is part of an existing one, and
    // if not, and it is a Rust project (i.e., has a Cargo.toml), then create a new client.
    for (let folder of e.added) {
        folder = getOuterMostWorkspaceFolder(folder);
        if (workspaces.has(folder.uri.toString())) {
            continue;
        }
        for (const f of fs.readdirSync(folder.uri.fsPath)) {
            if (f === 'Cargo.toml') {
                const workspace = new ClientWorkspace(folder);
                workspaces.set(folder.uri.toString(), workspace);
                workspace.start(context);
                break;
            }
        }
    }
    // If a workspace is removed which is a Rust workspace, kill the client.
    for (const folder of e.removed) {
        const ws = workspaces.get(folder.uri.toString());
        if (ws) {
            workspaces.delete(folder.uri.toString());
            ws.stop();
        }
    }
}
// Don't use URI as it's unreliable the same path might not become the same URI.
const workspaces = new Map();
let activeWorkspace;
let commandsRegistered = false;
// We run one RLS and one corresponding language client per workspace folder
// (VSCode workspace, not Cargo workspace). This class contains all the per-client
// and per-workspace stuff.
class ClientWorkspace {
    constructor(folder) {
        this.lc = null;
        this.config = configuration_1.RLSConfiguration.loadFromWorkspace(folder.uri.fsPath);
        this.folder = folder;
        this.disposables = [];
    }
    start(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.multiProjectEnabled) {
                warnOnMissingCargoToml();
            }
            spinner_1.startSpinner('RLS', 'Starting');
            const serverOptions = () => __awaiter(this, void 0, void 0, function* () {
                yield this.autoUpdate();
                return this.makeRlsProcess();
            });
            const pattern = this.config.multiProjectEnabled
                ? `${this.folder.uri.path}/**`
                : undefined;
            const collectionName = this.config.multiProjectEnabled
                ? `rust ${this.folder.uri.toString()}`
                : 'rust';
            const clientOptions = {
                // Register the server for Rust files
                documentSelector: [
                    { language: 'rust', scheme: 'file', pattern },
                    { language: 'rust', scheme: 'untitled', pattern },
                ],
                diagnosticCollectionName: collectionName,
                synchronize: { configurationSection: 'rust' },
                // Controls when to focus the channel rather than when to reveal it in the drop-down list
                revealOutputChannelOn: this.config.revealOutputChannelOn,
                initializationOptions: {
                    omitInitBuild: true,
                    cmdRun: true,
                },
                workspaceFolder: this.folder,
            };
            // Changes paths between Windows and Windows Subsystem for Linux
            if (this.config.useWSL) {
                clientOptions.uriConverters = {
                    code2Protocol: (uri) => {
                        const res = vscode_1.Uri.file(wslpath_1.uriWindowsToWsl(uri.fsPath)).toString();
                        console.log(`code2Protocol for path ${uri.fsPath} -> ${res}`);
                        return res;
                    },
                    protocol2Code: (wslUri) => {
                        const urlDecodedPath = vscode_1.Uri.parse(wslUri).path;
                        const winPath = vscode_1.Uri.file(wslpath_1.uriWslToWindows(urlDecodedPath));
                        console.log(`protocol2Code for path ${wslUri} -> ${winPath.fsPath}`);
                        return winPath;
                    },
                };
            }
            // Create the language client and start the client.
            this.lc = new vscode_languageclient_1.LanguageClient('rust-client', 'Rust Language Server', serverOptions, clientOptions);
            const selector = this.config.multiProjectEnabled
                ? { language: 'rust', scheme: 'file', pattern }
                : { language: 'rust' };
            this.setupProgressCounter();
            this.registerCommands(context, this.config.multiProjectEnabled);
            this.disposables.push(tasks_1.activateTaskProvider(this.folder));
            this.disposables.push(this.lc.start());
            this.disposables.push(vscode_1.languages.registerSignatureHelpProvider(selector, new signatureHelpProvider_1.SignatureHelpProvider(this.lc), '(', ','));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lc) {
                yield this.lc.stop();
            }
            this.disposables.forEach(d => d.dispose());
            commandsRegistered = false;
        });
    }
    registerCommands(context, multiProjectEnabled) {
        if (!this.lc) {
            return;
        }
        if (multiProjectEnabled && commandsRegistered) {
            return;
        }
        commandsRegistered = true;
        const rustupUpdateDisposable = vscode_1.commands.registerCommand('rls.update', () => {
            const ws = multiProjectEnabled && activeWorkspace ? activeWorkspace : this;
            return rustup_1.rustupUpdate(ws.config.rustupConfig());
        });
        this.disposables.push(rustupUpdateDisposable);
        const restartServer = vscode_1.commands.registerCommand('rls.restart', () => __awaiter(this, void 0, void 0, function* () {
            const ws = multiProjectEnabled && activeWorkspace ? activeWorkspace : this;
            yield ws.stop();
            return ws.start(context);
        }));
        this.disposables.push(restartServer);
        this.disposables.push(vscode_1.commands.registerCommand('rls.run', (cmd) => {
            const ws = multiProjectEnabled && activeWorkspace ? activeWorkspace : this;
            tasks_1.runRlsCommand(ws.folder, cmd);
        }));
    }
    setupProgressCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lc) {
                return;
            }
            const runningProgress = new Set();
            yield this.lc.onReady();
            spinner_1.stopSpinner('RLS');
            this.lc.onNotification(new vscode_languageclient_1.NotificationType('window/progress'), progress => {
                if (progress.done) {
                    runningProgress.delete(progress.id);
                }
                else {
                    runningProgress.add(progress.id);
                }
                if (runningProgress.size) {
                    let status = '';
                    if (typeof progress.percentage === 'number') {
                        status = `${Math.round(progress.percentage * 100)}%`;
                    }
                    else if (progress.message) {
                        status = progress.message;
                    }
                    else if (progress.title) {
                        status = `[${progress.title.toLowerCase()}]`;
                    }
                    spinner_1.startSpinner('RLS', status);
                }
                else {
                    spinner_1.stopSpinner('RLS');
                }
            });
        });
    }
    getSysroot(env) {
        return __awaiter(this, void 0, void 0, function* () {
            const wslWrapper = child_process_1.withWsl(this.config.useWSL);
            const rustcPrintSysroot = () => this.config.rustupDisabled
                ? wslWrapper.exec('rustc --print sysroot', { env })
                : wslWrapper.exec(`${this.config.rustupPath} run ${this.config.channel} rustc --print sysroot`, { env });
            const { stdout } = yield rustcPrintSysroot();
            return stdout
                .toString()
                .replace('\n', '')
                .replace('\r', '');
        });
    }
    // Make an evironment to run the RLS.
    makeRlsEnv(args = {
        setLibPath: false,
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Shallow clone, we don't want to modify this process' $PATH or
            // $(DY)LD_LIBRARY_PATH
            const env = Object.assign({}, process.env);
            let sysroot;
            try {
                sysroot = yield this.getSysroot(env);
            }
            catch (err) {
                console.info(err.message);
                console.info(`Let's retry with extended $PATH`);
                env.PATH = `${env.HOME || '~'}/.cargo/bin:${env.PATH || ''}`;
                try {
                    sysroot = yield this.getSysroot(env);
                }
                catch (e) {
                    console.warn('Error reading sysroot (second try)', e);
                    vscode_1.window.showWarningMessage(`Error reading sysroot: ${e.message}`);
                    return env;
                }
            }
            console.info(`Setting sysroot to`, sysroot);
            if (args.setLibPath) {
                function appendEnv(envVar, newComponent) {
                    const old = process.env[envVar];
                    return old ? `${newComponent}:${old}` : newComponent;
                }
                const newComponent = path.join(sysroot, 'lib');
                env.DYLD_LIBRARY_PATH = appendEnv('DYLD_LIBRARY_PATH', newComponent);
                env.LD_LIBRARY_PATH = appendEnv('LD_LIBRARY_PATH', newComponent);
            }
            return env;
        });
    }
    makeRlsProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            // Run "rls" from the PATH unless there's an override.
            const rlsPath = this.config.rlsPath || 'rls';
            // We don't need to set [DY]LD_LIBRARY_PATH if we're using rustup,
            // as rustup will set it for us when it chooses a toolchain.
            // NOTE: Needs an installed toolchain when using rustup, hence we don't call
            // it immediately here.
            const makeRlsEnv = () => this.makeRlsEnv({
                setLibPath: this.config.rustupDisabled,
            });
            const cwd = this.folder.uri.fsPath;
            let childProcess;
            if (this.config.rustupDisabled) {
                console.info(`running without rustup: ${rlsPath}`);
                const env = yield makeRlsEnv();
                childProcess = child_process.spawn(rlsPath, [], {
                    env,
                    cwd,
                    shell: true,
                });
            }
            else {
                console.info(`running with rustup: ${rlsPath}`);
                const config = this.config.rustupConfig();
                yield rustup_1.ensureToolchain(config);
                if (!this.config.rlsPath) {
                    // We only need a rustup-installed RLS if we weren't given a
                    // custom RLS path.
                    console.info('will use a rustup-installed RLS; ensuring present');
                    yield rustup_1.checkForRls(config);
                }
                const env = yield makeRlsEnv();
                childProcess = child_process_1.withWsl(config.useWSL).spawn(config.path, ['run', config.channel, rlsPath], { env, cwd, shell: true });
            }
            childProcess.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    console.error(`Could not spawn RLS: ${err.message}`);
                    vscode_1.window.showWarningMessage(`Could not spawn RLS: \`${err.message}\``);
                }
            });
            if (this.config.logToFile) {
                const logPath = path.join(this.folder.uri.fsPath, `rls${Date.now()}.log`);
                const logStream = fs.createWriteStream(logPath, { flags: 'w+' });
                childProcess.stderr.pipe(logStream);
            }
            return childProcess;
        });
    }
    autoUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.updateOnStartup && !this.config.rustupDisabled) {
                yield rustup_1.rustupUpdate(this.config.rustupConfig());
            }
        });
    }
}
function warnOnMissingCargoToml() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode_1.workspace.findFiles('Cargo.toml');
        if (files.length < 1) {
            vscode_1.window.showWarningMessage('A Cargo.toml file must be at the root of the workspace in order to support all features. Alternatively set rust-client.enableMultiProjectSetup=true in settings.');
        }
    });
}
/**
 * Sets up additional language configuration that's impossible to do via a
 * separate language-configuration.json file. See [1] for more information.
 *
 * [1]: https://github.com/Microsoft/vscode/issues/11514#issuecomment-244707076
 */
function configureLanguage() {
    return vscode_1.languages.setLanguageConfiguration('rust', {
        onEnterRules: [
            {
                // Doc single-line comment
                // e.g. ///|
                beforeText: /^\s*\/{3}.*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: '/// ' },
            },
            {
                // Parent doc single-line comment
                // e.g. //!|
                beforeText: /^\s*\/{2}\!.*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: '//! ' },
            },
            {
                // Begins an auto-closed multi-line comment (standard or parent doc)
                // e.g. /** | */ or /*! | */
                beforeText: /^\s*\/\*(\*|\!)(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent, appendText: ' * ' },
            },
            {
                // Begins a multi-line comment (standard or parent doc)
                // e.g. /** ...| or /*! ...|
                beforeText: /^\s*\/\*(\*|\!)(?!\/)([^\*]|\*(?!\/))*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: ' * ' },
            },
            {
                // Continues a multi-line comment
                // e.g.  * ...|
                beforeText: /^(\ \ )*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: '* ' },
            },
            {
                // Dedents after closing a multi-line comment
                // e.g.  */|
                beforeText: /^(\ \ )*\ \*\/\s*$/,
                action: { indentAction: vscode_1.IndentAction.None, removeText: 1 },
            },
        ],
    });
}
//# sourceMappingURL=extension.js.map