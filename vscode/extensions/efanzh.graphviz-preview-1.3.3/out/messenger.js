"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createMessenger(port, handler) {
    const maxIds = 2 ** 50;
    const pendingCalls = new Map();
    let previousId = -1;
    async function handleRequest(wrappedMessage) {
        const { id, message } = wrappedMessage;
        try {
            port.send({
                id,
                result: await handler(message),
                type: "success"
            });
        }
        catch (error) {
            port.send({
                id,
                message: String(error),
                type: "failure"
            });
        }
    }
    async function handleResponse(wrappedMessage) {
        const [resolver, rejector] = pendingCalls.get(wrappedMessage.id);
        pendingCalls.delete(wrappedMessage.id);
        if (wrappedMessage.type === "success") {
            resolver(wrappedMessage.result);
        }
        else {
            rejector(wrappedMessage.message);
        }
    }
    port.onReceive(async (wrappedMessage) => {
        if (wrappedMessage.type === "request") {
            await handleRequest(wrappedMessage);
        }
        else {
            await handleResponse(wrappedMessage);
        }
    });
    function generateId() {
        previousId = (previousId + 1) % maxIds;
        if (pendingCalls.has(previousId)) {
            throw new Error("Well this is unexpected.");
        }
        return previousId;
    }
    async function send(message) {
        return new Promise((resolve, reject) => {
            const wrappedMessage = {
                id: generateId(),
                message,
                type: "request"
            };
            pendingCalls.set(wrappedMessage.id, [resolve, reject]);
            port.send(wrappedMessage);
        });
    }
    return send;
}
exports.createMessenger = createMessenger;
//# sourceMappingURL=messenger.js.map