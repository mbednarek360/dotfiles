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