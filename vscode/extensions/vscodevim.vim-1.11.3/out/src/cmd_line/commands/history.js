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
const node_1 = require("../node");
const actions_1 = require("../../actions/commands/actions");
const searchState_1 = require("../../state/searchState");
var HistoryCommandType;
(function (HistoryCommandType) {
    HistoryCommandType[HistoryCommandType["Cmd"] = 0] = "Cmd";
    HistoryCommandType[HistoryCommandType["Search"] = 1] = "Search";
    HistoryCommandType[HistoryCommandType["Expr"] = 2] = "Expr";
    HistoryCommandType[HistoryCommandType["Input"] = 3] = "Input";
    HistoryCommandType[HistoryCommandType["Debug"] = 4] = "Debug";
    HistoryCommandType[HistoryCommandType["All"] = 5] = "All";
})(HistoryCommandType = exports.HistoryCommandType || (exports.HistoryCommandType = {}));
// http://vimdoc.sourceforge.net/htmldoc/cmdline.html#:history
class HistoryCommand extends node_1.CommandBase {
    constructor(args) {
        super();
        this._name = 'history';
        this._arguments = args;
    }
    get arguments() {
        return this._arguments;
    }
    execute(vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this._arguments.type) {
                case HistoryCommandType.Cmd:
                    yield new actions_1.CommandShowCommandHistory().exec(vimState.cursorStopPosition, vimState);
                    break;
                case HistoryCommandType.Search:
                    yield new actions_1.CommandShowSearchHistory(searchState_1.SearchDirection.Forward).exec(vimState.cursorStopPosition, vimState);
                    break;
                // TODO: Implement these
                case HistoryCommandType.Expr:
                    throw new Error('Not implemented');
                case HistoryCommandType.Input:
                    throw new Error('Not implemented');
                case HistoryCommandType.Debug:
                    throw new Error('Not implemented');
                case HistoryCommandType.All:
                    throw new Error('Not implemented');
            }
        });
    }
}
exports.HistoryCommand = HistoryCommand;

//# sourceMappingURL=history.js.map
