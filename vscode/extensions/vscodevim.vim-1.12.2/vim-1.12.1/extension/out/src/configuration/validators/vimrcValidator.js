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
const fs = require("fs");
const iconfigurationValidator_1 = require("../iconfigurationValidator");
const vimrc_1 = require("../vimrc");
class VimrcValidator {
    validate(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new iconfigurationValidator_1.ValidatorResults();
            if (config.vimrc.enable && !fs.existsSync(vimrc_1.vimrc.vimrcPath)) {
                result.append({
                    level: 'error',
                    message: `.vimrc not found at ${config.vimrc.path}`,
                });
            }
            return result;
        });
    }
    disable(config) {
        // no-op
    }
}
exports.VimrcValidator = VimrcValidator;

//# sourceMappingURL=vimrcValidator.js.map
