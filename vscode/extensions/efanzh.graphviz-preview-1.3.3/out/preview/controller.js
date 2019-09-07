"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
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