"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
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