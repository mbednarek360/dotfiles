"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSvgUri(uri) {
    return uri.path.endsWith('.svg');
}
exports.isSvgUri = isSvgUri;
function withSvgPreviewSchemaUri(uri) {
    return uri.with({
        scheme: 'svg-preview',
        query: uri.toString()
    });
}
exports.withSvgPreviewSchemaUri = withSvgPreviewSchemaUri;
//# sourceMappingURL=utils.js.map