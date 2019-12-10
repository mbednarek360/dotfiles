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
class VimrcKeyRemappingBuilderImpl {
    /**
     * @returns A remapping if the given `line` parses to one, and `undefined` otherwise.
     */
    build(line) {
        return __awaiter(this, void 0, void 0, function* () {
            const matches = VimrcKeyRemappingBuilderImpl.KEY_REMAPPING_REG_EX.exec(line);
            if (!matches || matches.length < 4) {
                return undefined;
            }
            const type = matches[1];
            const before = matches[2];
            const after = matches[3];
            const vscodeCommands = yield vscode.commands.getCommands();
            const vimCommand = after.match(VimrcKeyRemappingBuilderImpl.VIM_COMMAND_REG_EX);
            let command;
            if (vscodeCommands.includes(after)) {
                command = { commands: [after] };
            }
            else if (vimCommand) {
                command = { commands: [vimCommand[1]] };
            }
            else {
                command = { after: VimrcKeyRemappingBuilderImpl.buildKeyList(after) };
            }
            return {
                keyRemapping: Object.assign({ before: VimrcKeyRemappingBuilderImpl.buildKeyList(before), source: 'vimrc' }, command),
                keyRemappingType: type,
            };
        });
    }
    static buildKeyList(keyString) {
        let keyList = [];
        let matches = null;
        do {
            matches = VimrcKeyRemappingBuilderImpl.KEY_LIST_REG_EX.exec(keyString);
            if (matches) {
                keyList.push(matches[0]);
            }
        } while (matches);
        return keyList;
    }
}
VimrcKeyRemappingBuilderImpl.KEY_REMAPPING_REG_EX = /(^.*map)\s([\S]+)\s+([\S]+)$/;
VimrcKeyRemappingBuilderImpl.KEY_LIST_REG_EX = /(<[^>]+>|.)/g;
VimrcKeyRemappingBuilderImpl.VIM_COMMAND_REG_EX = /^(:\w+)<[Cc][Rr]>$/;
exports.vimrcKeyRemappingBuilder = new VimrcKeyRemappingBuilderImpl();

//# sourceMappingURL=vimrcKeyRemappingBuilder.js.map
