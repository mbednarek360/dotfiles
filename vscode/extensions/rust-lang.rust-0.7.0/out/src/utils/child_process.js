"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const util = require("util");
const wslpath_1 = require("./wslpath");
const execAsync = util.promisify(child_process.exec);
function withWsl(withWsl) {
    return withWsl
        ? {
            exec: withWslModifiedParameters(execAsync),
            execSync: withWslModifiedParameters(child_process.execSync),
            spawn: withWslModifiedParameters(child_process.spawn),
            modifyArgs: wslpath_1.modifyParametersForWSL,
        }
        : {
            exec: execAsync,
            execSync: child_process.execSync,
            spawn: child_process.spawn,
            modifyArgs: (command, args) => ({ command, args }),
        };
}
exports.withWsl = withWsl;
function withWslModifiedParameters(
// tslint:disable-next-line: no-any
func) {
    // tslint:disable-next-line: no-any
    return (command, arg1, ...rest) => {
        if (arg1 instanceof Array) {
            ({ command, args: arg1 } = wslpath_1.modifyParametersForWSL(command, arg1));
        }
        return func(command, ...[arg1, ...rest]);
    };
}
//# sourceMappingURL=child_process.js.map