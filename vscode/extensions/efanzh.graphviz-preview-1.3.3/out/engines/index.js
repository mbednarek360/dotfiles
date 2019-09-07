"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration = require("../configuration");
const dot = require("./dot");
function getCurrentEngine() {
    const engineName = configuration.getNullableConfiguration("engine", "dot");
    switch (engineName) {
        case "dot":
            return dot.getEngine();
        default:
            throw new Error(`Unsupported engine: “${engineName}”.`);
    }
}
let currentEngineInstance = getCurrentEngine();
exports.currentEngine = Object.freeze({
    renderToSvg(source, workingDir, cancel) {
        return currentEngineInstance.renderToSvg(source, workingDir, cancel);
    },
    saveToFile(source, svgContent, filePath, workingDir) {
        return currentEngineInstance.saveToFile(source, svgContent, filePath, workingDir);
    }
});
function updateConfiguration() {
    currentEngineInstance = getCurrentEngine();
}
exports.updateConfiguration = updateConfiguration;
//# sourceMappingURL=index.js.map