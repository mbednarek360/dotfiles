/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./out/preview/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./out/messenger.js":
/*!**************************!*\
  !*** ./out/messenger.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),

/***/ "./out/preview/app.js":
/*!****************************!*\
  !*** ./out/preview/app.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __webpack_require__(/*! ./controller */ "./out/preview/controller.js");
const theXmlParser = new DOMParser();
function rawParseSvg(image) {
    return theXmlParser.parseFromString(image, "image/svg+xml");
}
const theDefaultImage = rawParseSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px"></svg>').documentElement;
function parseSVG(image) {
    const imageDocument = rawParseSvg(image);
    const rootElement = imageDocument.documentElement;
    if (rootElement instanceof SVGSVGElement) {
        return rootElement;
    }
    else {
        const partialSvg = imageDocument.querySelector("svg");
        const errorMessage = imageDocument.querySelector("parsererror>div").textContent;
        return [partialSvg, errorMessage];
    }
}
function measureImageSize(svg) {
    return [svg.width.baseVal.value, svg.height.baseVal.value];
}
class App {
    constructor(imageValue, status, controller, appEventListener) {
        this.imageValue = imageValue;
        this.status = status;
        this.controller = controller;
        this.appEventListener = appEventListener;
    }
    static create(width, height, appEventListener) {
        const [imageWidth, imageHeight] = measureImageSize(theDefaultImage);
        return new App(theDefaultImage.outerHTML, null, controller_1.Controller.create(width, height, imageWidth, imageHeight, this.contentMargin, appEventListener, this.zoomStep, this.offsetStep, this.initialZoomMode), appEventListener);
    }
    static fromArchive(archive, appEventListener) {
        return new App(archive.image, archive.status, controller_1.Controller.fromArchive(archive.controller, appEventListener), appEventListener);
    }
    get image() {
        return this.imageValue;
    }
    beginDrag(x, y) {
        return this.controller.beginDrag(x, y);
    }
    makeCenter() {
        this.controller.makeCenter();
    }
    makeIdentity() {
        this.controller.makeIdentity();
    }
    moveDown() {
        this.controller.moveDown();
    }
    moveLeft() {
        this.controller.moveLeft();
    }
    moveRight() {
        this.controller.moveRight();
    }
    moveUp() {
        this.controller.moveUp();
    }
    resize(width, height) {
        this.controller.resize(width, height);
    }
    setZoomMode(zoomMode) {
        this.controller.setZoomMode(zoomMode);
    }
    toggleOverview(x, y) {
        this.controller.toggleOverview(x, y);
    }
    toggleOverviewCenter() {
        this.controller.toggleOverviewCenter();
    }
    zoomIn(x, y) {
        this.controller.zoomIn(x, y);
    }
    zoomOut(x, y) {
        this.controller.zoomOut(x, y);
    }
    zoomInCenter() {
        this.controller.zoomInCenter();
    }
    zoomOutCenter() {
        this.controller.zoomOutCenter();
    }
    setImage(image) {
        const result = parseSVG(image);
        let svg;
        if (result instanceof SVGSVGElement) {
            svg = result;
            this.imageValue = image;
            this.status = null;
        }
        else {
            const [maybeSvg, errorMessage] = result;
            svg = maybeSvg === null ? theDefaultImage : maybeSvg;
            this.imageValue = svg.outerHTML;
            this.status = `Invalid SVG: ${errorMessage}`;
        }
        const [imageWidth, imageHeight] = measureImageSize(svg);
        this.controller.resizeContent(imageWidth, imageHeight);
        // A hack to remove extra space of the graph within the img element.
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        this.appEventListener.onImageChanged(svg);
        this.appEventListener.onStatusChanged(this.status);
    }
    setStatus(status) {
        this.status = status;
        this.appEventListener.onStatusChanged(status);
    }
    serialize() {
        return {
            controller: this.controller.serialize(),
            image: this.image,
            status: this.status
        };
    }
}
App.contentMargin = 10;
App.zoomStep = 1.2;
App.offsetStep = 10;
App.initialZoomMode = 2 /* AutoFit */;
exports.App = App;
//# sourceMappingURL=app.js.map

/***/ }),

/***/ "./out/preview/controller.js":
/*!***********************************!*\
  !*** ./out/preview/controller.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = __webpack_require__(/*! ./view */ "./out/preview/view.js");
const defaultNormalZoom = 2;
function hasEnoughSpace(contentWidth, contentHeight, availableWidth, availableHeight) {
    return contentWidth < availableWidth && contentHeight < availableHeight;
}
function viewHasEnoughSpace(view) {
    const contentMargin = view.contentMargin * 2;
    return hasEnoughSpace(view.contentWidth, view.contentHeight, view.width - contentMargin, view.height - contentMargin);
}
function viewHasEnoughSpaceWithContentSize(view, contentWidth, contentHeight) {
    const contentMargin = view.contentMargin * 2;
    return hasEnoughSpace(contentWidth, contentHeight, view.width - contentMargin, view.height - contentMargin);
}
function viewHasEnoughSpaceWithSize(view, width, height) {
    const contentMargin = view.contentMargin * 2;
    return hasEnoughSpace(view.contentWidth, view.contentHeight, width - contentMargin, height - contentMargin);
}
class FixedState {
    constructor() {
        this.zoomMode = 0 /* Fixed */;
    }
    static fromArchive(archive) {
        switch (archive.type) {
            case "FixedNormalState":
                return FixedNormalState.fromArchive(archive);
            case "Fixed100PercentState":
                return Fixed100PercentState.fromArchive(archive);
        }
    }
    static create(width, height, contentWidth, contentHeight, contentMargin, savedZoom) {
        const contentMargin2 = contentMargin * 2;
        if (hasEnoughSpace(contentWidth, contentHeight, width - contentMargin2, height - contentMargin2)) {
            return new Fixed100PercentState(view_1.IdentityView.createCenter(width, height, contentWidth, contentHeight, contentMargin), savedZoom);
        }
        else {
            return new FixedNormalState(view_1.View.createFit(width, height, contentWidth, contentHeight, contentMargin));
        }
    }
    moveTo(x, y) {
        this.view.contentX = x;
        this.view.contentY = y;
        return this;
    }
    resize(width, height) {
        this.view.resize(width, height);
        return this;
    }
    resizeContent(width, height) {
        this.view.resizeContent(width, height);
        return this;
    }
    resizeAll(width, height, contentWidth, contentHeight, contentMargin) {
        this.view.resizeAll(width, height, contentWidth, contentHeight);
        this.view.contentMargin = contentMargin;
    }
}
class FixedNormalState extends FixedState {
    constructor(view) {
        super();
        this.view = view;
    }
    static fromArchive(archive) {
        return new FixedNormalState(view_1.View.fromArchive(archive.view));
    }
    setZoomMode(zoomMode) {
        switch (zoomMode) {
            case 0 /* Fixed */:
                return this;
            case 1 /* Fit */:
                return new FitState(this.view.toFit(), this, this.view.zoom);
            case 2 /* AutoFit */:
                return AutoFitState.fromFixedView(this.view, this, this.view.zoom);
        }
    }
    toggleOverview(x, y) {
        return new Fixed100PercentState(this.view.toIdentity(x, y), this.view.zoom);
    }
    zoomTo(x, y, zoom) {
        this.view.zoomTo(x, y, zoom);
        return this;
    }
    serialize() {
        return {
            type: "FixedNormalState",
            view: this.view.serialize()
        };
    }
}
class Fixed100PercentState extends FixedState {
    constructor(view, savedZoom) {
        super();
        this.view = view;
        this.savedZoom = savedZoom;
    }
    static fromArchive(archive) {
        return new Fixed100PercentState(view_1.IdentityView.fromArchive(archive.view), archive.savedZoom);
    }
    setZoomMode(zoomMode) {
        switch (zoomMode) {
            case 0 /* Fixed */:
                return this;
            case 1 /* Fit */:
                return new FitState(this.view.toFit(), this, this.savedZoom);
            case 2 /* AutoFit */:
                return AutoFitState.fromFixedView(this.view, this, this.savedZoom);
        }
    }
    toggleOverview(x, y) {
        return new FixedNormalState(this.view.zoomTo(x, y, this.savedZoom));
    }
    zoomTo(x, y, zoom) {
        return new FixedNormalState(this.view.zoomTo(x, y, zoom));
    }
    serialize() {
        return {
            savedZoom: this.savedZoom,
            type: "Fixed100PercentState",
            view: this.view.serialize()
        };
    }
}
class FitState {
    constructor(view, savedState, savedZoom) {
        this.view = view;
        this.savedState = savedState;
        this.savedZoom = savedZoom;
        this.zoomMode = 1 /* Fit */;
    }
    static fromArchive(archive) {
        return new FitState(view_1.FitView.fromArchive(archive.view), archive.savedState === undefined ? undefined : FixedState.fromArchive(archive.savedState), archive.savedZoom);
    }
    moveTo(x, y) {
        return new FixedNormalState(this.view.moveTo(x, y));
    }
    resize(width, height) {
        this.view.resize(width, height);
        return this;
    }
    resizeContent(width, height) {
        this.view.resizeContent(width, height);
        return this;
    }
    setZoomMode(zoomMode) {
        switch (zoomMode) {
            case 0 /* Fixed */:
                if (this.savedState === undefined) {
                    return FixedState.create(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin, this.view.zoom);
                }
                else {
                    this.savedState.resizeAll(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin);
                    return this.savedState;
                }
            case 1 /* Fit */:
                return this;
            case 2 /* AutoFit */:
                return AutoFitState.fromFitView(this.view, this.savedState, this.savedZoom);
        }
    }
    toggleOverview(x, y) {
        return new Fixed100PercentState(this.view.toIdentity(x, y), this.view.zoom);
    }
    zoomTo(x, y, zoom) {
        return new FixedNormalState(this.view.zoomTo(x, y, zoom));
    }
    serialize() {
        return {
            savedState: this.savedState === undefined ? undefined : this.savedState.serialize(),
            savedZoom: this.savedZoom,
            type: "FitState",
            view: this.view.serialize()
        };
    }
}
class AutoFitState {
    constructor() {
        this.zoomMode = 2 /* AutoFit */;
    }
    static create(width, height, contentWidth, contentHeight, contentMargin) {
        const contentMargin2 = contentMargin * 2;
        if (hasEnoughSpace(contentWidth, contentHeight, width - contentMargin2, height - contentMargin2)) {
            const view = new view_1.IdentityCenterView(width, height, contentWidth, contentHeight, contentMargin);
            return new AutoFit100PercentState(view, undefined, defaultNormalZoom);
        }
        else {
            const view = new view_1.FitView(width, height, contentWidth, contentHeight, contentMargin);
            return new AutoFitFitState(view, undefined, view.zoom);
        }
    }
    static fromFixedView(view, savedState, savedZoom) {
        if (viewHasEnoughSpace(view)) {
            return new AutoFit100PercentState(view.toIdentityCenter(), savedState, savedZoom);
        }
        else {
            return new AutoFitFitState(view.toFit(), savedState, savedZoom);
        }
    }
    static fromFitView(view, savedState, savedZoom) {
        if (viewHasEnoughSpace(view)) {
            return new AutoFit100PercentState(view.toIdentityCenter(), savedState, savedZoom);
        }
        else {
            return new AutoFitFitState(view, savedState, savedZoom);
        }
    }
    zoomTo(x, y, zoom) {
        return new FixedNormalState(this.view.zoomTo(x, y, zoom));
    }
}
class AutoFit100PercentState extends AutoFitState {
    constructor(view, savedState, savedZoom) {
        super();
        this.view = view;
        this.savedState = savedState;
        this.savedZoom = savedZoom;
    }
    static fromArchive(archive) {
        return new AutoFit100PercentState(view_1.IdentityCenterView.fromArchive(archive.view), archive.savedState === undefined ? undefined : FixedState.fromArchive(archive.savedState), archive.savedZoom);
    }
    moveTo(x, y) {
        return new Fixed100PercentState(this.view.moveTo(x, y), this.savedZoom);
    }
    resize(width, height) {
        if (viewHasEnoughSpaceWithSize(this.view, width, height)) {
            this.view.resize(width, height);
            return this;
        }
        else {
            return new AutoFitFitState(this.view.toFitWithSize(width, height), this.savedState, this.savedZoom);
        }
    }
    resizeContent(width, height) {
        if (viewHasEnoughSpaceWithContentSize(this.view, width, height)) {
            this.view.resizeContent(width, height);
            return this;
        }
        else {
            return new AutoFitFitState(this.view.toFitWithContentSize(width, height), this.savedState, this.savedZoom);
        }
    }
    setZoomMode(zoomMode) {
        switch (zoomMode) {
            case 0 /* Fixed */:
                if (this.savedState === undefined) {
                    return FixedState.create(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin, this.savedZoom);
                }
                else {
                    this.savedState.resizeAll(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin);
                    return this.savedState;
                }
            case 1 /* Fit */:
                return new FitState(this.view.toFit(), this.savedState, this.savedZoom);
            case 2 /* AutoFit */:
                return this;
        }
    }
    toggleOverview(x, y) {
        return new FixedNormalState(this.view.zoomTo(x, y, this.savedZoom));
    }
    serialize() {
        return {
            savedState: this.savedState === undefined ? undefined : this.savedState.serialize(),
            savedZoom: this.savedZoom,
            type: "AutoFit100PercentState",
            view: this.view.serialize()
        };
    }
}
class AutoFitFitState extends AutoFitState {
    constructor(view, savedState, savedZoom) {
        super();
        this.view = view;
        this.savedState = savedState;
        this.savedZoom = savedZoom;
    }
    static fromArchive(archive) {
        return new AutoFitFitState(view_1.FitView.fromArchive(archive.view), archive.savedState === undefined ? undefined : FixedState.fromArchive(archive.savedState), archive.savedZoom);
    }
    moveTo(x, y) {
        return new FixedNormalState(this.view.moveTo(x, y));
    }
    resize(width, height) {
        if (viewHasEnoughSpaceWithSize(this.view, width, height)) {
            return new AutoFit100PercentState(this.view.toIdentityCenterWithSize(width, height), this.savedState, this.savedZoom);
        }
        else {
            this.view.resize(width, height);
            return this;
        }
    }
    resizeContent(width, height) {
        if (viewHasEnoughSpaceWithContentSize(this.view, width, height)) {
            return new AutoFit100PercentState(this.view.toIdentityCenterWithContentSize(width, height), this.savedState, this.savedZoom);
        }
        else {
            this.view.resizeContent(width, height);
            return this;
        }
    }
    setZoomMode(zoomMode) {
        switch (zoomMode) {
            case 0 /* Fixed */:
                if (this.savedState === undefined) {
                    return FixedState.create(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin, this.view.zoom);
                }
                else {
                    this.savedState.resizeAll(this.view.width, this.view.height, this.view.contentWidth, this.view.contentHeight, this.view.contentMargin);
                    return this.savedState;
                }
            case 1 /* Fit */:
                return new FitState(this.view, this.savedState, this.savedZoom);
            case 2 /* AutoFit */:
                return this;
        }
    }
    toggleOverview(x, y) {
        return new Fixed100PercentState(this.view.toIdentity(x, y), this.view.zoom);
    }
    serialize() {
        return {
            savedState: this.savedState === undefined ? undefined : this.savedState.serialize(),
            savedZoom: this.savedZoom,
            type: "AutoFitFitState",
            view: this.view.serialize()
        };
    }
}
function stateFromArchive(archive) {
    switch (archive.type) {
        case "FixedNormalState":
            return FixedNormalState.fromArchive(archive);
        case "Fixed100PercentState":
            return Fixed100PercentState.fromArchive(archive);
        case "FitState":
            return FitState.fromArchive(archive);
        case "AutoFit100PercentState":
            return AutoFit100PercentState.fromArchive(archive);
        case "AutoFitFitState":
            return AutoFitFitState.fromArchive(archive);
    }
}
class Controller {
    constructor(state, zoomStep, offsetStep, viewEventListener) {
        this.state = state;
        this.zoomStep = zoomStep;
        this.offsetStep = offsetStep;
        this.viewEventListener = viewEventListener;
        this.notifyLayoutChanged();
        this.notifyZoomingModeChanged();
    }
    static create(width, height, contentWidth, contentHeight, contentMargin, viewEventListener, zoomStep, offsetStep, zoomMode) {
        let state;
        switch (zoomMode) {
            case 0 /* Fixed */:
                state = FixedState.create(width, height, contentWidth, contentHeight, contentMargin, defaultNormalZoom);
                break;
            case 1 /* Fit */:
                const view = new view_1.FitView(width, height, contentWidth, contentHeight, contentMargin);
                state = new FitState(view, undefined, view.zoom);
                break;
            case 2 /* AutoFit */:
                state = AutoFitState.create(width, height, contentWidth, contentHeight, contentMargin);
                break;
            default:
                throw new Error();
        }
        return new Controller(state, zoomStep, offsetStep, viewEventListener);
    }
    static fromArchive(archive, viewEventListener) {
        return new Controller(stateFromArchive(archive.state), archive.zoomStep, archive.offsetStep, viewEventListener);
    }
    beginDrag(x, y) {
        const offsetX = this.state.view.contentX - x;
        const offsetY = this.state.view.contentY - y;
        return (x1, y1) => this.moveTo(offsetX + x1, offsetY + y1);
    }
    makeCenter() {
        const view = this.state.view;
        if (!view.isCenter) {
            this.moveTo((view.width - view.contentWidth * view.zoom) / 2, (view.height - view.contentHeight * view.zoom) / 2);
        }
    }
    makeIdentity() {
        const view = this.state.view;
        if (!view.isIdentity) {
            this.toggleOverviewCenter();
        }
    }
    moveDown() {
        const view = this.state.view;
        this.moveTo(view.contentX, view.contentY + this.offsetStep);
    }
    moveLeft() {
        const view = this.state.view;
        this.moveTo(view.contentX - this.offsetStep, view.contentY);
    }
    moveRight() {
        const view = this.state.view;
        this.moveTo(view.contentX + this.offsetStep, view.contentY);
    }
    moveUp() {
        const view = this.state.view;
        this.moveTo(view.contentX, view.contentY - this.offsetStep);
    }
    resize(width, height) {
        this.state = this.state.resize(width, height);
        this.notifyLayoutChanged();
    }
    resizeContent(width, height) {
        this.state = this.state.resizeContent(width, height);
        this.notifyLayoutChanged();
    }
    setZoomMode(zoomMode) {
        this.state = this.state.setZoomMode(zoomMode);
        this.notifyLayoutChanged();
        this.notifyZoomingModeChanged();
    }
    toggleOverview(x, y) {
        this.state = this.state.toggleOverview(x, y);
        this.notifyLayoutChanged();
        this.notifyZoomingModeChanged();
    }
    toggleOverviewCenter() {
        const view = this.state.view;
        this.toggleOverview(view.width / 2, view.height / 2);
    }
    zoomIn(x, y) {
        this.zoomTo(x, y, this.state.view.zoom * this.zoomStep);
    }
    zoomInCenter() {
        const view = this.state.view;
        this.zoomTo(view.width / 2, view.height / 2, this.state.view.zoom * this.zoomStep);
    }
    zoomOut(x, y) {
        this.zoomTo(x, y, this.state.view.zoom / this.zoomStep);
    }
    zoomOutCenter() {
        const view = this.state.view;
        this.zoomTo(view.width / 2, view.height / 2, this.state.view.zoom / this.zoomStep);
    }
    serialize() {
        return {
            offsetStep: this.offsetStep,
            state: this.state.serialize(),
            zoomStep: this.zoomStep
        };
    }
    moveTo(x, y) {
        this.state = this.state.moveTo(x, y);
        this.notifyLayoutChanged();
        this.notifyZoomingModeChanged();
    }
    zoomTo(x, y, value) {
        this.state = this.state.zoomTo(x, y, value);
        this.notifyLayoutChanged();
        this.notifyZoomingModeChanged();
    }
    notifyLayoutChanged() {
        const view = this.state.view;
        this.viewEventListener.onLayoutChanged(view.contentX, view.contentY, view.contentWidth, view.contentHeight, view.zoom);
    }
    notifyZoomingModeChanged() {
        this.viewEventListener.onZoomModeChanged(this.state.zoomMode);
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map

/***/ }),

/***/ "./out/preview/main.js":
/*!*****************************!*\
  !*** ./out/preview/main.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const messenger_1 = __webpack_require__(/*! ../messenger */ "./out/messenger.js");
const app = __webpack_require__(/*! ./app */ "./out/preview/app.js");
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

/***/ }),

/***/ "./out/preview/view.js":
/*!*****************************!*\
  !*** ./out/preview/view.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function fit(width, height, contentWidth, contentHeight, contentMargin) {
    const contentMargin2 = contentMargin * 2;
    const zoomX = (width - contentMargin2) / contentWidth;
    const zoomY = (height - contentMargin2) / contentHeight;
    if (zoomX < zoomY) {
        return [contentMargin, (height - contentHeight * zoomX) / 2, zoomX];
    }
    else {
        return [(width - contentWidth * zoomY) / 2, contentMargin, zoomY];
    }
}
class FixedView {
    constructor(width, height, contentWidth, contentHeight, contentMargin, contentX, contentY, isCenter, isIdentity) {
        this.width = width;
        this.height = height;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
        this.contentMargin = contentMargin;
        this.contentX = contentX;
        this.contentY = contentY;
        this.isCenter = isCenter;
        this.isIdentity = isIdentity;
    }
    resize(width, height) {
        this.contentX += (width - this.width) / 2;
        this.contentY += (height - this.height) / 2;
        this.width = width;
        this.height = height;
    }
    resizeContent(width, height) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        this.contentX = halfWidth + (this.contentX - halfWidth) * width / this.contentWidth;
        this.contentY = halfHeight + (this.contentY - halfHeight) * height / this.contentHeight;
        this.contentWidth = width;
        this.contentHeight = height;
    }
    resizeAll(width, height, contentWidth, contentHeight) {
        this.contentX = (this.contentX - this.width / 2) * contentWidth / this.contentWidth + width / 2;
        this.contentY = (this.contentY - this.height / 2) * contentHeight / this.contentHeight + height / 2;
        this.width = width;
        this.height = height;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
    }
    toFit() {
        return new FitView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
    toIdentityCenter() {
        return new IdentityCenterView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
}
exports.FixedView = FixedView;
class View extends FixedView {
    constructor(width, height, contentWidth, contentHeight, contentMargin, contentX, contentY, zoom) {
        super(width, height, contentWidth, contentHeight, contentMargin, contentX, contentY, false, false);
        this.zoom = zoom;
    }
    static createFit(width, height, contentWidth, contentHeight, contentMargin) {
        const [x, y, zoom] = fit(width, height, contentWidth, contentHeight, contentMargin);
        return new View(width, height, contentWidth, contentHeight, contentMargin, x, y, zoom);
    }
    static fromArchive(archive) {
        return new View(archive.width, archive.height, archive.contentWidth, archive.contentHeight, archive.contentMargin, archive.contentX, archive.contentY, archive.zoom);
    }
    toIdentity(x, y) {
        return new IdentityView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x + (this.contentX - x) / this.zoom, y + (this.contentY - y) / this.zoom);
    }
    zoomTo(x, y, zoom) {
        this.contentX = x + (this.contentX - x) * zoom / this.zoom;
        this.contentY = y + (this.contentY - y) * zoom / this.zoom;
        this.zoom = zoom;
    }
    serialize() {
        return {
            contentHeight: this.contentHeight,
            contentMargin: this.contentMargin,
            contentWidth: this.contentWidth,
            contentX: this.contentX,
            contentY: this.contentY,
            height: this.height,
            type: "View",
            width: this.width,
            zoom: this.zoom
        };
    }
}
exports.View = View;
class IdentityView extends FixedView {
    constructor(width, height, contentWidth, contentHeight, contentMargin, contentX, contentY) {
        super(width, height, contentWidth, contentHeight, contentMargin, contentX, contentY, false, true);
        this.zoom = 1;
    }
    static createCenter(width, height, contentWidth, contentHeight, contentMargin) {
        return new IdentityView(width, height, contentWidth, contentHeight, contentMargin, (width - contentWidth) / 2, (height - contentHeight) / 2);
    }
    static fromArchive(archive) {
        return new IdentityView(archive.width, archive.height, archive.contentWidth, archive.contentHeight, archive.contentMargin, archive.contentX, archive.contentY);
    }
    zoomTo(x, y, zoom) {
        return new View(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x + (this.contentX - x) * zoom, y + (this.contentY - y) * zoom, zoom);
    }
    serialize() {
        return {
            contentHeight: this.contentHeight,
            contentMargin: this.contentMargin,
            contentWidth: this.contentWidth,
            contentX: this.contentX,
            contentY: this.contentY,
            height: this.height,
            type: "IdentityView",
            width: this.width
        };
    }
}
exports.IdentityView = IdentityView;
class FitView {
    constructor(width, height, contentWidth, contentHeight, contentMargin) {
        this.isIdentity = false;
        this.isCenter = true;
        this.widthValue = width;
        this.heightValue = height;
        this.contentWidthValue = contentWidth;
        this.contentHeightValue = contentHeight;
        this.contentMarginValue = contentMargin;
        [this.contentXValue, this.contentYValue, this.zoomValue] = fit(width, height, contentWidth, contentHeight, contentMargin);
    }
    static fromArchive(archive) {
        return new FitView(archive.width, archive.height, archive.contentWidth, archive.contentHeight, archive.contentMargin);
    }
    get width() {
        return this.widthValue;
    }
    get height() {
        return this.heightValue;
    }
    get contentWidth() {
        return this.contentWidthValue;
    }
    get contentHeight() {
        return this.contentHeightValue;
    }
    get contentMargin() {
        return this.contentMarginValue;
    }
    get contentX() {
        return this.contentXValue;
    }
    get contentY() {
        return this.contentYValue;
    }
    get zoom() {
        return this.zoomValue;
    }
    resize(width, height) {
        this.widthValue = width;
        this.heightValue = height;
        this.fit();
    }
    resizeContent(width, height) {
        this.contentWidthValue = width;
        this.contentHeightValue = height;
        this.fit();
    }
    zoomTo(x, y, zoom) {
        return new View(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x + (this.contentX - x) * zoom / this.zoom, y + (this.contentY - y) * zoom / this.zoom, zoom);
    }
    moveTo(x, y) {
        return new View(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x, y, this.zoom);
    }
    toIdentity(x, y) {
        return new IdentityView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x + (this.contentX - x) / this.zoom, y + (this.contentY - y) / this.zoom);
    }
    toIdentityCenter() {
        return new IdentityCenterView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
    toIdentityCenterWithSize(width, height) {
        return new IdentityCenterView(width, height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
    toIdentityCenterWithContentSize(width, height) {
        return new IdentityCenterView(this.width, this.height, width, height, this.contentMargin);
    }
    serialize() {
        return {
            contentHeight: this.contentHeight,
            contentMargin: this.contentMargin,
            contentWidth: this.contentWidth,
            height: this.height,
            type: "FitView",
            width: this.width
        };
    }
    fit() {
        [this.contentXValue, this.contentYValue, this.zoomValue] = fit(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
}
exports.FitView = FitView;
class IdentityCenterView {
    constructor(width, height, contentWidth, contentHeight, contentMargin) {
        this.contentMargin = contentMargin;
        this.isIdentity = true;
        this.isCenter = true;
        this.zoom = 1;
        this.widthValue = width;
        this.heightValue = height;
        this.contentWidthValue = contentWidth;
        this.contentHeightValue = contentHeight;
        this.contentXValue = (width - contentWidth) / 2;
        this.contentYValue = (height - contentHeight) / 2;
    }
    static fromArchive(archive) {
        return new IdentityCenterView(archive.width, archive.height, archive.contentWidth, archive.contentHeight, archive.contentMargin);
    }
    get width() {
        return this.widthValue;
    }
    get height() {
        return this.heightValue;
    }
    get contentWidth() {
        return this.contentWidthValue;
    }
    get contentHeight() {
        return this.contentHeightValue;
    }
    get contentX() {
        return this.contentXValue;
    }
    get contentY() {
        return this.contentYValue;
    }
    resize(width, height) {
        this.widthValue = width;
        this.heightValue = height;
        this.center();
    }
    resizeContent(width, height) {
        this.contentWidthValue = width;
        this.contentHeightValue = height;
        this.center();
    }
    moveTo(x, y) {
        return new IdentityView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x, y);
    }
    zoomTo(x, y, zoom) {
        return new View(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin, x + (this.contentX - x) * zoom, y + (this.contentY - y) * zoom, zoom);
    }
    toFit() {
        return new FitView(this.width, this.height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
    toFitWithSize(width, height) {
        return new FitView(width, height, this.contentWidth, this.contentHeight, this.contentMargin);
    }
    toFitWithContentSize(width, height) {
        return new FitView(this.width, this.height, width, height, this.contentMargin);
    }
    serialize() {
        return {
            contentHeight: this.contentHeight,
            contentMargin: this.contentMargin,
            contentWidth: this.contentWidth,
            height: this.height,
            type: "IdentityCenterView",
            width: this.width
        };
    }
    center() {
        this.contentXValue = (this.width - this.contentWidth) / 2;
        this.contentYValue = (this.height - this.contentHeight) / 2;
    }
}
exports.IdentityCenterView = IdentityCenterView;
//# sourceMappingURL=view.js.map

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map