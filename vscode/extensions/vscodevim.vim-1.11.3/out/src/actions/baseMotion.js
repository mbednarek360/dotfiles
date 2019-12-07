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
const position_1 = require("../common/motion/position");
const base_1 = require("./base");
const mode_1 = require("../mode/mode");
function isIMovement(o) {
    return o.start !== undefined && o.stop !== undefined;
}
exports.isIMovement = isIMovement;
var SelectionType;
(function (SelectionType) {
    SelectionType[SelectionType["Concatenating"] = 0] = "Concatenating";
    SelectionType[SelectionType["Expanding"] = 1] = "Expanding";
})(SelectionType = exports.SelectionType || (exports.SelectionType = {}));
class BaseMovement extends base_1.BaseAction {
    constructor(keysPressed, isRepeat) {
        super();
        this.modes = [mode_1.ModeName.Normal, mode_1.ModeName.Visual, mode_1.ModeName.VisualLine, mode_1.ModeName.VisualBlock];
        this.isMotion = true;
        /**
         * If isJump is true, then the cursor position will be added to the jump list on completion.
         *
         * Default to false, as many motions operate on a single line and do not count as a jump.
         */
        this.isJump = false;
        /**
         * If movement can be repeated with semicolon or comma this will be true when
         * running the repetition.
         */
        this.isRepeat = false;
        /**
         * Whether we should change desiredColumn in VimState.
         */
        this.doesntChangeDesiredColumn = false;
        /**
         * This is for commands like $ which force the desired column to be at
         * the end of even the longest line.
         */
        this.setsDesiredColumnToEOL = false;
        this.minCount = 1;
        this.maxCount = 99999;
        this.selectionType = SelectionType.Concatenating;
        if (keysPressed) {
            this.keysPressed = keysPressed;
        }
        if (isRepeat) {
            this.isRepeat = isRepeat;
        }
    }
    /**
     * Run the movement a single time.
     *
     * Generally returns a new Position. If necessary, it can return an IMovement instead.
     * Note: If returning an IMovement, make sure that repeated actions on a
     * visual selection work. For example, V}}
     */
    execAction(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented!');
        });
    }
    /**
     * Run the movement in an operator context a single time.
     *
     * Some movements operate over different ranges when used for operators.
     */
    execActionForOperator(position, vimState) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execAction(position, vimState);
        });
    }
    /**
     * Run a movement count times.
     *
     * count: the number prefix the user entered, or 0 if they didn't enter one.
     */
    execActionWithCount(position, vimState, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let recordedState = vimState.recordedState;
            let result = new position_1.Position(0, 0); // bogus init to satisfy typechecker
            let prevResult = undefined;
            let firstMovementStart = new position_1.Position(position.line, position.character);
            count = this.clampCount(count);
            for (let i = 0; i < count; i++) {
                const firstIteration = i === 0;
                const lastIteration = i === count - 1;
                result = yield this.createMovementResult(position, vimState, recordedState, lastIteration);
                if (result instanceof position_1.Position) {
                    position = result;
                }
                else if (isIMovement(result)) {
                    if (prevResult && result.failed) {
                        return prevResult;
                    }
                    if (firstIteration) {
                        firstMovementStart = new position_1.Position(result.start.line, result.start.character);
                    }
                    position = this.adjustPosition(position, result, lastIteration);
                    prevResult = result;
                }
            }
            if (this.selectionType === SelectionType.Concatenating && isIMovement(result)) {
                result.start = firstMovementStart;
            }
            return result;
        });
    }
    clampCount(count) {
        count = Math.max(count, this.minCount);
        count = Math.min(count, this.maxCount);
        return count;
    }
    createMovementResult(position, vimState, recordedState, lastIteration) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = recordedState.operator && lastIteration
                ? yield this.execActionForOperator(position, vimState)
                : yield this.execAction(position, vimState);
            return result;
        });
    }
    adjustPosition(position, result, lastIteration) {
        if (!lastIteration) {
            position = result.stop.getRightThroughLineBreaks();
        }
        return position;
    }
}
exports.BaseMovement = BaseMovement;

//# sourceMappingURL=baseMotion.js.map
