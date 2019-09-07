'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function set(store, ret) {
    if (ret != null) {
        if (ret.then)
            return ret.then(store.setState);
        store.setState(ret);
    }
}

var finalMiddleware = function (store, args) { return function (action) {
    return set(store, action.apply(void 0, [store.getState()].concat(args)));
}; };
function applyMiddleware() {
    var middlewares = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        middlewares[_i] = arguments[_i];
    }
    middlewares.reverse();
    return function (store, action, args) {
        if (middlewares.length < 1) {
            return set(store, action.apply(void 0, [store.getState()].concat(args)));
        }
        var chain = middlewares
            .map(function (middleware) { return middleware(store); })
            .reduce(function (next, middleware) { return middleware(next, args); }, finalMiddleware(store, args));
        return chain(action);
    };
}

exports.applyMiddleware = applyMiddleware;
