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
const logger_1 = require("./logger");
/**
 * A thin wrapper around `vscode.env.clipboard`
 */
class Clipboard {
    static Copy(text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield vscode.env.clipboard.writeText(text);
            }
            catch (e) {
                this.logger.error(e, `Error copying to clipboard. err=${e}`);
            }
        });
    }
    static Paste() {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.env.clipboard.readText();
        });
    }
}
exports.Clipboard = Clipboard;
Clipboard.logger = logger_1.Logger.get('Clipboard');

//# sourceMappingURL=clipboard.js.map
