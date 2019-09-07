import messageBroker from './';

const TELEMETRY_EVENT_ZOOM = 'zoom';
const TELEMETRY_EVENT_CHANGE_BACKGROUND = 'changeBackground';

class TelemetryReporter {
    sendZoomEvent(type: string, source: string) {
        messageBroker.send({
            command: 'sendTelemetryEvent',
            payload: {
                eventName: TELEMETRY_EVENT_ZOOM,
                properties: { type, source }
            }
        });
    }

    sendChangeBackgroundEvent(from: string, to: string) {
        messageBroker.send({
            command: 'sendTelemetryEvent',
            payload: {
                eventName: TELEMETRY_EVENT_CHANGE_BACKGROUND,
                properties: { from, to }
            }
        });
    }
}

export default new TelemetryReporter();