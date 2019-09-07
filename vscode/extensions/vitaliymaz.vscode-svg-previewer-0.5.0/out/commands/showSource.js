"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("../telemetry");
class ShowSourceCommand {
    constructor(previewManager, telemetryReporter) {
        this.previewManager = previewManager;
        this.telemetryReporter = telemetryReporter;
        this.id = 'svg.showSource';
    }
    execute() {
        this.telemetryReporter.sendTelemetryEvent(telemetry_1.TelemetryEvents.TELEMETRY_EVENT_SHOW_SOURCE);
        this.previewManager.showSource();
    }
}
exports.ShowSourceCommand = ShowSourceCommand;
//# sourceMappingURL=showSource.js.map