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
const crypto = require("crypto");
const vscode_1 = require("vscode");
/**
 * Displayed identifier associated with each task.
 */
const TASK_SOURCE = 'Rust';
/**
 * Internal VSCode task type (namespace) under which extensions register their
 * tasks. We only use `cargo` task type.
 */
const TASK_TYPE = 'cargo';
/**
 * Creates a Task-used `ShellExecution` from a unified `Execution` interface.
 */
function createShellExecution(execution) {
    const { binary, command, args, cwd, env } = execution;
    const cmdLine = `${command || binary} ${args.join(' ')}`;
    return new vscode_1.ShellExecution(cmdLine, { cwd, env });
}
function activateTaskProvider(target) {
    const provider = {
        // Tasks returned by this function are treated as 'auto-detected' [1] and
        // are treated a bit differently. They are always available and can be
        // only tweaked (and not removed) in tasks.json.
        // This is to support npm-style scripts, which store project-specific
        // scripts in the project manifest. However, Cargo.toml does not support
        // anything like that, so we just try our best to help the user and present
        // them with most commonly used `cargo` subcommands (e.g. `build`).
        // Since typically they would need to parse their task definitions, an
        // optional `autoDetect` configuration is usually provided, which we don't.
        //
        // [1]: https://code.visualstudio.com/docs/editor/tasks#_task-autodetection
        provideTasks: () => detectCargoTasks(target),
        // NOTE: Currently unused by VSCode
        resolveTask: () => undefined,
    };
    return vscode_1.tasks.registerTaskProvider(TASK_TYPE, provider);
}
exports.activateTaskProvider = activateTaskProvider;
function detectCargoTasks(target) {
    return [
        { subcommand: 'build', group: vscode_1.TaskGroup.Build },
        { subcommand: 'check', group: vscode_1.TaskGroup.Build },
        { subcommand: 'test', group: vscode_1.TaskGroup.Test },
        { subcommand: 'clean', group: vscode_1.TaskGroup.Clean },
        { subcommand: 'run', group: undefined },
    ]
        .map(({ subcommand, group }) => ({
        definition: { subcommand, type: TASK_TYPE },
        label: `cargo ${subcommand}`,
        execution: createShellExecution({ command: 'cargo', args: [subcommand] }),
        group,
        problemMatchers: ['$rustc'],
    }))
        .map(task => {
        // NOTE: It's important to solely use the VSCode-provided constructor (and
        // *not* use object spread operator!) - otherwise the task will not be picked
        // up by VSCode.
        const vscodeTask = new vscode_1.Task(task.definition, target, task.label, TASK_SOURCE, task.execution, task.problemMatchers);
        vscodeTask.group = task.group;
        return vscodeTask;
    });
}
// NOTE: `execution` parameters here are sent by the RLS.
function runRlsCommand(folder, execution) {
    const shellExecution = createShellExecution(execution);
    const problemMatchers = ['$rustc'];
    return vscode_1.tasks.executeTask(new vscode_1.Task({ type: 'shell' }, folder, 'External RLS command', TASK_SOURCE, shellExecution, problemMatchers));
}
exports.runRlsCommand = runRlsCommand;
/**
 * Starts a shell command as a VSCode task, resolves when a task is finished.
 * Useful in tandem with setup commands, since the task window is reusable and
 * also capable of displaying ANSI terminal colors. Exit codes are not
 * supported, however.
 */
function runTaskCommand({ command, args, env, cwd }, displayName, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueId = crypto.randomBytes(20).toString();
        const task = new vscode_1.Task({ label: uniqueId, type: 'shell' }, folder ? folder : vscode_1.workspace.workspaceFolders[0], displayName, TASK_SOURCE, new vscode_1.ShellExecution(`${command} ${args.join(' ')}`, {
            cwd: cwd || (folder && folder.uri.fsPath),
            env,
        }));
        return new Promise(resolve => {
            const disposable = vscode_1.tasks.onDidEndTask(({ execution }) => {
                if (execution.task === task) {
                    disposable.dispose();
                    resolve();
                }
            });
            vscode_1.tasks.executeTask(task);
        });
    });
}
exports.runTaskCommand = runTaskCommand;
//# sourceMappingURL=tasks.js.map