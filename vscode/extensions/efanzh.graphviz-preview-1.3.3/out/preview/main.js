"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messenger_1 = require("../messenger");
const app = require("./app");
function onReady(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    }
    else {
        callback();
    }
}
onReady(() => {
    const vscode = acquireVsCodeApi();
    const zoomElement = document.getElementById("zoom");
    const identityElement = document.getElementById("identity");
    const centerElement = document.getElementById("center");
    const zoomModeFixedElement = document.querySelector('input[name="zoom-mode"][value="fixed"]');
    const zoomModeFitElement = document.querySelector('input[name="zoom-mode"][value="fit"]');
    const zoomModeAutoFitElement = document.querySelector('input[name="zoom-mode"][value="auto-fit"]');
    const exportElement = document.getElementById("export");
    const workspaceElement = document.getElementById("workspace");
    const imageElement = document.getElementById("image");
    const statusElement = document.getElementById("status");
    class AppEventListener {
        onImageChanged(image) {
            imageElement.innerHTML = "";
            imageElement.appendChild(image);
        }
        onStatusChanged(status) {
            statusElement.textContent = status;
        }
        onZoomModeChanged(zoomMode) {
            switch (zoomMode) {
                case 0 /* Fixed */:
                    zoomModeFixedElement.checked = true;
                    break;
                case 1 /* Fit */:
                    zoomModeFitElement.checked = true;
                    break;
                case 2 /* AutoFit */:
                    zoomModeAutoFitElement.checked = true;
                    break;
            }
        }
        onLayoutChanged(x, y, width, height, zoom) {
            zoomElement.textContent = `${Math.round(zoom * 10000) / 100}%`;
            imageElement.style.cssText = `left:${x}px;top:${y}px;width:${width * zoom}px;height:${height * zoom}px`;
        }
    }
    let theApp;
    // Message handler.
    class ExtensionPort {
        send(message) {
            vscode.postMessage(message);
        }
        onReceive(handler) {
            window.addEventListener("message", (ev) => {
                handler(ev.data);
            });
        }
    }
    async function handleRequest(message) {
        switch (message.type) {
            case "initialize":
                theApp = app.App.create(workspaceElement.offsetWidth, workspaceElement.offsetHeight, new AppEventListener());
                registerEventListeners();
                break;
            case "restore":
                theApp = app.App.fromArchive(message.archive, new AppEventListener());
                registerEventListeners();
                // TODO: Is this really necessary?
                theApp.resize(workspaceElement.offsetWidth, workspaceElement.offsetHeight);
                break;
            case "success":
                if (message.image === "") {
                    theApp.setStatus("No graph is generated");
                }
                else {
                    try {
                        theApp.setImage(message.image);
                    }
                    catch (error) {
                        theApp.setStatus(error.toString());
                    }
                }
                break;
            case "failure":
                theApp.setStatus(message.message);
                break;
            case "serialize":
                return {
                    result: theApp.serialize(),
                    type: "serializeResponse"
                };
        }
        return undefined;
    }
    const messenger = messenger_1.createMessenger(new ExtensionPort(), handleRequest);
    function registerEventListeners() {
        // Window.
        window.addEventListener("keydown", (ev) => {
            switch (ev.key) {
                case " ":
                    theApp.toggleOverviewCenter();
                    break;
                case "_":
                case "-":
                    theApp.zoomOutCenter();
                    break;
                case "+":
                case "=":
                    theApp.zoomInCenter();
                    break;
                case "0":
                    theApp.makeIdentity();
                    break;
                case "A":
                case "ArrowLeft":
                case "a":
                    theApp.moveRight();
                    break;
                case "ArrowDown":
                case "S":
                case "s":
                    theApp.moveUp();
                    break;
                case "ArrowRight":
                case "D":
                case "d":
                    theApp.moveLeft();
                    break;
                case "ArrowUp":
                case "W":
                case "w":
                    theApp.moveDown();
                    break;
                case "X":
                case "x":
                    theApp.makeCenter();
                    break;
            }
        });
        window.addEventListener("resize", () => theApp.resize(workspaceElement.offsetWidth, workspaceElement.offsetHeight));
        // Identity element.
        identityElement.addEventListener("click", () => theApp.makeIdentity());
        // Center element.
        centerElement.addEventListener("click", () => theApp.makeCenter());
        // Zoom mode elements.
        function updateZoomMode() {
            if (this.checked) {
                switch (this.value) {
                    case "fixed":
                        theApp.setZoomMode(0 /* Fixed */);
                        break;
                    case "fit":
                        theApp.setZoomMode(1 /* Fit */);
                        break;
                    case "auto-fit":
                        theApp.setZoomMode(2 /* AutoFit */);
                        break;
                }
            }
        }
        zoomModeFixedElement.addEventListener("change", updateZoomMode);
        zoomModeFitElement.addEventListener("change", updateZoomMode);
        zoomModeAutoFitElement.addEventListener("change", updateZoomMode);
        // Export element.
        exportElement.addEventListener("click", async () => messenger({
            image: theApp.image,
            type: "export"
        }));
        // Workspace element.
        workspaceElement.addEventListener("click", (ev) => {
            if (ev.detail % 2 === 0) {
                theApp.toggleOverview(ev.clientX, ev.clientY);
            }
        });
        workspaceElement.addEventListener("wheel", (ev) => {
            if (ev.deltaY < 0) {
                theApp.zoomIn(ev.clientX, ev.clientY);
            }
            else {
                theApp.zoomOut(ev.clientX, ev.clientY);
            }
        });
        workspaceElement.addEventListener("pointerdown", (ev) => {
            const handler = theApp.beginDrag(ev.clientX, ev.clientY);
            const pointerMoveListener = (ev1) => handler(ev1.clientX, ev1.clientY);
            const pointerUpListener = () => {
                workspaceElement.removeEventListener("pointermove", pointerMoveListener);
                workspaceElement.removeEventListener("pointerup", pointerUpListener);
                workspaceElement.releasePointerCapture(ev.pointerId);
                workspaceElement.style.cursor = "";
            };
            workspaceElement.addEventListener("pointermove", pointerMoveListener);
            workspaceElement.addEventListener("pointerup", pointerUpListener);
            workspaceElement.setPointerCapture(ev.pointerId);
            workspaceElement.style.cursor = "-webkit-grabbing";
        });
    }
});
//# sourceMappingURL=main.js.map