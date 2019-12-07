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
const iconfigurationValidator_1 = require("../iconfigurationValidator");
const util_1 = require("util");
const child_process_1 = require("child_process");
const path = require("path");
const fs_1 = require("fs");
class NeovimValidator {
    validate(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new iconfigurationValidator_1.ValidatorResults();
            if (config.enableNeovim) {
                let triedToParsePath = false;
                try {
                    // Try to find nvim in path if it is not defined
                    if (config.neovimPath === '') {
                        const pathVar = process.env.PATH;
                        if (pathVar) {
                            pathVar.split(';').forEach(element => {
                                let neovimExecutable = 'nvim';
                                if (process.platform === 'win32') {
                                    neovimExecutable += '.exe';
                                }
                                const testPath = path.join(element, neovimExecutable);
                                if (fs_1.existsSync(testPath)) {
                                    config.neovimPath = testPath;
                                    triedToParsePath = true;
                                    return;
                                }
                            });
                        }
                    }
                    yield util_1.promisify(child_process_1.execFile)(config.neovimPath, ['--version']);
                }
                catch (e) {
                    let errorMessage = `Invalid neovimPath. ${e.message}.`;
                    if (triedToParsePath) {
                        errorMessage += `Tried to parse PATH ${config.neovimPath}.`;
                    }
                    result.append({
                        level: 'error',
                        message: errorMessage,
                    });
                }
            }
            return Promise.resolve(result);
        });
    }
    disable(config) {
        config.enableNeovim = false;
    }
}
exports.NeovimValidator = NeovimValidator;

//# sourceMappingURL=neovimValidator.js.map
