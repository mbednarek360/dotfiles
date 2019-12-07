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
/**
 * @file This module handles running the RLS via rustup, including checking that
 * rustup is installed and installing any required components/toolchains.
 */
const vscode_1 = require("vscode");
const spinner_1 = require("./spinner");
const tasks_1 = require("./tasks");
const child_process_1 = require("./utils/child_process");
const REQUIRED_COMPONENTS = ['rust-analysis', 'rust-src', 'rls'];
function isInstalledRegex(componentName) {
    return new RegExp(`^(${componentName}.*) \\((default|installed)\\)$`);
}
function rustupUpdate(config) {
    return __awaiter(this, void 0, void 0, function* () {
        spinner_1.startSpinner('RLS', 'Updating…');
        try {
            const { stdout } = yield child_process_1.withWsl(config.useWSL).exec(`${config.path} update`);
            // This test is imperfect because if the user has multiple toolchains installed, they
            // might have one updated and one unchanged. But I don't want to go too far down the
            // rabbit hole of parsing rustup's output.
            if (stdout.includes('unchanged')) {
                spinner_1.stopSpinner('Up to date.');
            }
            else {
                spinner_1.stopSpinner('Up to date. Restart extension for changes to take effect.');
            }
        }
        catch (e) {
            console.log(e);
            spinner_1.stopSpinner('An error occurred whilst trying to update.');
        }
    });
}
exports.rustupUpdate = rustupUpdate;
/**
 * Check for the user-specified toolchain (and that rustup exists).
 */
function ensureToolchain(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield hasToolchain(config)) {
            return;
        }
        const clicked = yield vscode_1.window.showInformationMessage(`${config.channel} toolchain not installed. Install?`, 'Yes');
        if (clicked) {
            yield tryToInstallToolchain(config);
        }
        else {
            throw new Error();
        }
    });
}
exports.ensureToolchain = ensureToolchain;
/**
 * Checks for required RLS components and prompts the user to install if it's
 * not already.
 */
function checkForRls(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield hasRlsComponents(config)) {
            return;
        }
        const clicked = yield Promise.resolve(vscode_1.window.showInformationMessage('RLS not installed. Install?', 'Yes'));
        if (clicked) {
            yield installRlsComponents(config);
            vscode_1.window.showInformationMessage('RLS successfully installed! Enjoy! 🎉');
        }
        else {
            throw new Error();
        }
    });
}
exports.checkForRls = checkForRls;
function hasToolchain(config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { stdout } = yield child_process_1.withWsl(config.useWSL).exec(`${config.path} toolchain list`);
            return stdout.includes(config.channel);
        }
        catch (e) {
            console.log(e);
            const rustupFoundButNotInWSLMode = config.useWSL && (yield hasRustup(Object.assign({ useWSL: false }, config)));
            vscode_1.window.showErrorMessage(rustupFoundButNotInWSLMode
                ? `Rustup is installed but can't be found under WSL. Ensure that
        invoking \`wsl rustup\` works correctly.`
                : 'Rustup not available. Install from https://www.rustup.rs/');
            throw e;
        }
    });
}
function tryToInstallToolchain(config) {
    return __awaiter(this, void 0, void 0, function* () {
        spinner_1.startSpinner('RLS', 'Installing toolchain…');
        try {
            const { command, args } = child_process_1.withWsl(config.useWSL).modifyArgs(config.path, [
                'toolchain',
                'install',
                config.channel,
            ]);
            yield tasks_1.runTaskCommand({ command, args }, 'Installing toolchain…');
            if (!(yield hasToolchain(config))) {
                throw new Error();
            }
        }
        catch (e) {
            console.log(e);
            vscode_1.window.showErrorMessage(`Could not install ${config.channel} toolchain`);
            spinner_1.stopSpinner(`Could not install toolchain`);
            throw e;
        }
    });
}
/**
 * Returns an array of components for specified `config.channel` toolchain.
 * These are parsed as-is, e.g. `rustc-x86_64-unknown-linux-gnu (default)` is a
 * valid listed component name.
 */
function listComponents(config) {
    return __awaiter(this, void 0, void 0, function* () {
        return child_process_1.withWsl(config.useWSL)
            .exec(`${config.path} component list --toolchain ${config.channel}`)
            .then(({ stdout }) => stdout
            .toString()
            .replace('\r', '')
            .split('\n'));
    });
}
function hasRlsComponents(config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const components = yield listComponents(config);
            return REQUIRED_COMPONENTS.map(isInstalledRegex).every(isInstalledRegex => components.some(c => isInstalledRegex.test(c)));
        }
        catch (e) {
            console.log(e);
            vscode_1.window.showErrorMessage(`Can't detect RLS components: ${e.message}`);
            spinner_1.stopSpinner("Can't detect RLS components");
            throw e;
        }
    });
}
function installRlsComponents(config) {
    return __awaiter(this, void 0, void 0, function* () {
        spinner_1.startSpinner('RLS', 'Installing components…');
        for (const component of REQUIRED_COMPONENTS) {
            try {
                const { command, args } = child_process_1.withWsl(config.useWSL).modifyArgs(config.path, [
                    'component',
                    'add',
                    component,
                    '--toolchain',
                    config.channel,
                ]);
                yield tasks_1.runTaskCommand({ command, args }, `Installing \`${component}\``);
                const isInstalled = isInstalledRegex(component);
                const listedComponents = yield listComponents(config);
                if (!listedComponents.some(c => isInstalled.test(c))) {
                    throw new Error();
                }
            }
            catch (e) {
                spinner_1.stopSpinner(`Could not install component \`${component}\``);
                vscode_1.window.showErrorMessage(`Could not install component: \`${component}\`${e.message ? `, message: ${e.message}` : ''}`);
                throw e;
            }
        }
        spinner_1.stopSpinner('RLS components installed successfully');
    });
}
/**
 * Parses given output of `rustup show` and retrieves the local active toolchain.
 */
function parseActiveToolchain(rustupOutput) {
    // There may a default entry under 'installed toolchains' section, so search
    // for currently active/overridden one only under 'active toolchain' section
    const activeToolchainsIndex = rustupOutput.search('active toolchain');
    if (activeToolchainsIndex !== -1) {
        rustupOutput = rustupOutput.substr(activeToolchainsIndex);
        const matchActiveChannel = /^(\S*) \((?:default|overridden)/gm;
        const match = matchActiveChannel.exec(rustupOutput);
        if (!match) {
            throw new Error(`couldn't find active toolchain under 'active toolchains'`);
        }
        else if (matchActiveChannel.exec(rustupOutput)) {
            throw new Error(`multiple active toolchains found under 'active toolchains'`);
        }
        return match[1];
    }
    // Try matching the third line as the active toolchain
    const match = /^(?:.*\r?\n){2}(\S*) \((?:default|overridden)/.exec(rustupOutput);
    if (match) {
        return match[1];
    }
    throw new Error(`couldn't find active toolchains`);
}
exports.parseActiveToolchain = parseActiveToolchain;
function getVersion(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionRegex = /rustup ([0-9]+\.[0-9]+\.[0-9]+)/;
        const output = yield child_process_1.withWsl(config.useWSL).exec(`${config.path} --version`);
        const versionMatch = output.stdout.toString().match(versionRegex);
        if (versionMatch && versionMatch.length >= 2) {
            return versionMatch[1];
        }
        else {
            throw new Error("Couldn't parse rustup version");
        }
    });
}
exports.getVersion = getVersion;
/**
 * Returns whether Rustup is invokable and available.
 */
function hasRustup(config) {
    return getVersion(config)
        .then(() => true)
        .catch(() => false);
}
exports.hasRustup = hasRustup;
/**
 * Returns active (including local overrides) toolchain, as specified by rustup.
 * May throw if rustup at specified path can't be executed.
 */
function getActiveChannel(wsPath, config) {
    // rustup info might differ depending on where it's executed
    // (e.g. when a toolchain is locally overriden), so executing it
    // under our current workspace root should give us close enough result
    let activeChannel;
    try {
        // `rustup show active-toolchain` is available since rustup 1.12.0
        activeChannel = child_process_1.withWsl(config.useWSL)
            .execSync(`${config.path} show active-toolchain`, { cwd: wsPath })
            .toString()
            .trim();
        // Since rustup 1.17.0 if the active toolchain is the default, we're told
        // by means of a " (default)" suffix, so strip that off if it's present
        // If on the other hand there's an override active, we'll get an
        // " (overridden by ...)" message instead.
        activeChannel = activeChannel.replace(/ \(.*\)$/, '');
    }
    catch (e) {
        // Possibly an old rustup version, so try rustup show
        const showOutput = child_process_1.withWsl(config.useWSL)
            .execSync(`${config.path} show`, { cwd: wsPath })
            .toString();
        activeChannel = parseActiveToolchain(showOutput);
    }
    console.info(`Detected active channel: ${activeChannel} (since 'rust-client.channel' is unspecified)`);
    return activeChannel;
}
exports.getActiveChannel = getActiveChannel;
//# sourceMappingURL=rustup.js.map