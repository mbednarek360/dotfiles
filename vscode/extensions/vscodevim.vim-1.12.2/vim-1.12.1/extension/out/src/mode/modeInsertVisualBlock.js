"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mode_1 = require("./mode");
const mode_2 = require("./mode");
class InsertVisualBlockMode extends mode_1.Mode {
    constructor() {
        super(mode_1.ModeName.VisualBlockInsertMode);
        this.text = "Visual Block Insert Mode";
        this.cursorType = mode_2.VSCodeVimCursorType.Native;
        this.isVisualMode = true;
    }
}
exports.InsertVisualBlockMode = InsertVisualBlockMode;
//# sourceMappingURL=modeInsertVisualBlock.js.map