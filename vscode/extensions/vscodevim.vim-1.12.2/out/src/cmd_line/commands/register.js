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
const vscode = require("vscode");
const register_1 = require("../../register/register");
const recordedState_1 = require("../../state/recordedState");
const node = require("../node");
class RegisterCommand extends node.CommandBase {
    constructor(args) {
        super();
        this._arguments = args;
    }
    get arguments() {
        return this._arguments;
    }
    getRegisterDisplayValue(register) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = (yield register_1.Register.getByKey(register)).text;
            if (result instanceof Array) {
                result = result.join('\n').substr(0, 100);
            }
            else if (result instanceof recordedState_1.RecordedState) {
                result = result.actionsRun.map(x => x.keysPressed.join('')).join('');
            }
            return result;
        });
    }
    displayRegisterValue(register) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.getRegisterDisplayValue(register);
            result = result.replace(/\n/g, '\\n');
            vscode.window.showInformationMessage(`${register} ${result}`);
        });
    }
    execute(vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.arguments.registers.length === 1) {
                yield this.displayRegisterValue(this.arguments.registers[0]);
            }
            else {
                const currentRegisterKeys = register_1.Register.getKeys().filter(reg => reg !== '_' &&
                    (this.arguments.registers.length === 0 || this.arguments.registers.includes(reg)));
                const registerKeyAndContent = new Array();
                for (let registerKey of currentRegisterKeys) {
                    registerKeyAndContent.push({
                        label: registerKey,
                        description: yield this.getRegisterDisplayValue(registerKey),
                    });
                }
                vscode.window.showQuickPick(registerKeyAndContent).then((val) => __awaiter(this, void 0, void 0, function* () {
                    if (val) {
                        let result = val.description;
                        vscode.window.showInformationMessage(`${val.label} ${result}`);
                    }
                }));
            }
        });
    }
}
exports.RegisterCommand = RegisterCommand;

//# sourceMappingURL=register.js.map
