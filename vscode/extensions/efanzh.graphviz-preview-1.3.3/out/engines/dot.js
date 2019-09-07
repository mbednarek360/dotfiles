"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const configuration = require("../configuration");
const utilities = require("../utilities");
function getEngine() {
    const dot = configuration.getNullableConfiguration("dotPath", "dot");
    const args = ["-T", "svg"];
    const imageFormatMap = {
        ".PDF": "pdf",
        ".PNG": "png",
        ".SVG": "svg"
    };
    function getOutputFormat(filePath) {
        return imageFormatMap[path.extname(filePath).toUpperCase()];
    }
    return Object.freeze({
        async renderToSvg(source, workingDir, cancel) {
            try {
                const [exitCode, stdout, stderr] = await utilities.runChildProcess(dot, args, workingDir, source, cancel);
                if (exitCode === 0) {
                    return stdout;
                }
                else {
                    throw new Error(stderr.trim());
                }
            }
            catch (error) {
                if (error.code === "ENOENT") {
                    throw new Error(`Program not found: “${dot}”.\nPlease check your configuration.`);
                }
                else {
                    throw error;
                }
            }
        },
        saveToFile(source, svgContent, filePath, workingDir) {
            const format = getOutputFormat(filePath);
            if (format) {
                if (format === "svg") {
                    return utilities.writeFileAsync(filePath, svgContent);
                }
                else {
                    return utilities.runChildProcess(dot, ["-T", format, "-o", filePath], workingDir, source).then((value) => {
                        const [exitCode, , stderr] = value;
                        if (exitCode !== 0) {
                            throw new Error(stderr.trim());
                        }
                    });
                }
            }
            else {
                return Promise.reject(new Error("Unsupported output format."));
            }
        }
    });
}
exports.getEngine = getEngine;
//# sourceMappingURL=dot.js.map