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
const modeHandler_1 = require("./modeHandler");
/**
 * Stores one ModeHandler (and therefore VimState) per editor.
 */
class ModeHandlerMapImpl {
    constructor() {
        this.modeHandlerMap = new Map();
    }
    getOrCreate(editorId) {
        return __awaiter(this, void 0, void 0, function* () {
            let isNew = false;
            let modeHandler;
            for (const [key, value] of this.modeHandlerMap.entries()) {
                if (key.isEqual(editorId)) {
                    modeHandler = value;
                }
            }
            if (!modeHandler) {
                isNew = true;
                modeHandler = yield modeHandler_1.ModeHandler.Create();
                this.modeHandlerMap.set(editorId, modeHandler);
            }
            return [modeHandler, isNew];
        });
    }
    get(editorId) {
        return this.modeHandlerMap.get(editorId);
    }
    getKeys() {
        return [...this.modeHandlerMap.keys()];
    }
    getAll() {
        return [...this.modeHandlerMap.values()];
    }
    delete(editorId) {
        const modeHandler = this.modeHandlerMap.get(editorId);
        if (modeHandler) {
            modeHandler.dispose();
            this.modeHandlerMap.delete(editorId);
        }
    }
    clear() {
        for (const key of this.modeHandlerMap.keys()) {
            this.delete(key);
        }
    }
}
exports.ModeHandlerMap = new ModeHandlerMapImpl();

//# sourceMappingURL=modeHandlerMap.js.map
