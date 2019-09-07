"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const events = require("./events");
const extensionId = require('../../package.json').name;
const extensionVersion = require('../../package.json').version;
const key = Buffer.from('NGFjNjAyODUtYWZkYi00N2VkLTg4ZmMtMjI0YjY1YmJiMTFh', 'base64').toString();
function createTelemetryReporter() {
    return new vscode_extension_telemetry_1.default(extensionId, extensionVersion, key);
}
exports.createTelemetryReporter = createTelemetryReporter;
exports.TelemetryEvents = events;
//# sourceMappingURL=index.js.map