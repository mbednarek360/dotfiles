"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * We consider two editors to be the same iff their EditorIdentities are the same
 */
class EditorIdentity {
    constructor(fileName) {
        this._fileName = fileName;
    }
    static fromEditor(textEditor) {
        var _a, _b, _c;
        return new EditorIdentity((_c = (_b = (_a = textEditor) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.fileName, (_c !== null && _c !== void 0 ? _c : '')));
    }
    /**
     * For use in tests
     */
    static createRandomEditorIdentity() {
        return new EditorIdentity(Math.random()
            .toString(36)
            .substring(7));
    }
    get fileName() {
        return this._fileName;
    }
    isEqual(other) {
        return this.fileName === other.fileName;
    }
    toString() {
        return this.fileName;
    }
}
exports.EditorIdentity = EditorIdentity;

//# sourceMappingURL=editorIdentity.js.map
