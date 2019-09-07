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
/******/ 	return __webpack_require__(__webpack_require__.s = "./preview-src/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),

/***/ "./node_modules/preact/dist/preact.mjs":
/*!*********************************************!*\
  !*** ./node_modules/preact/dist/preact.mjs ***!
  \*********************************************/
/*! exports provided: default, h, createElement, cloneElement, Component, render, rerender, options */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneElement", function() { return cloneElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return Component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rerender", function() { return rerender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "options", function() { return options; });
var VNode = function VNode() {};

var options = {};

var stack = [];

var EMPTY_CHILDREN = [];

function h(nodeName, attributes) {
	var children = EMPTY_CHILDREN,
	    lastSimple,
	    child,
	    simple,
	    i;
	for (i = arguments.length; i-- > 2;) {
		stack.push(arguments[i]);
	}
	if (attributes && attributes.children != null) {
		if (!stack.length) stack.push(attributes.children);
		delete attributes.children;
	}
	while (stack.length) {
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length; i--;) {
				stack.push(child[i]);
			}
		} else {
			if (typeof child === 'boolean') child = null;

			if (simple = typeof nodeName !== 'function') {
				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
			}

			if (simple && lastSimple) {
				children[children.length - 1] += child;
			} else if (children === EMPTY_CHILDREN) {
				children = [child];
			} else {
				children.push(child);
			}

			lastSimple = simple;
		}
	}

	var p = new VNode();
	p.nodeName = nodeName;
	p.children = children;
	p.attributes = attributes == null ? undefined : attributes;
	p.key = attributes == null ? undefined : attributes.key;

	if (options.vnode !== undefined) options.vnode(p);

	return p;
}

function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

function cloneElement(vnode, props) {
  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

var items = [];

function enqueueRender(component) {
	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
		(options.debounceRendering || defer)(rerender);
	}
}

function rerender() {
	var p,
	    list = items;
	items = [];
	while (p = list.pop()) {
		if (p._dirty) renderComponent(p);
	}
}

function isSameNodeType(node, vnode, hydrating) {
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		return node.splitText !== undefined;
	}
	if (typeof vnode.nodeName === 'string') {
		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	}
	return hydrating || node._componentConstructor === vnode.nodeName;
}

function isNamedNode(node, nodeName) {
	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

function getNodeProps(vnode) {
	var props = extend({}, vnode.attributes);
	props.children = vnode.children;

	var defaultProps = vnode.nodeName.defaultProps;
	if (defaultProps !== undefined) {
		for (var i in defaultProps) {
			if (props[i] === undefined) {
				props[i] = defaultProps[i];
			}
		}
	}

	return props;
}

function createNode(nodeName, isSvg) {
	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	node.normalizedNodeName = nodeName;
	return node;
}

function removeNode(node) {
	var parentNode = node.parentNode;
	if (parentNode) parentNode.removeChild(node);
}

function setAccessor(node, name, old, value, isSvg) {
	if (name === 'className') name = 'class';

	if (name === 'key') {} else if (name === 'ref') {
		if (old) old(null);
		if (value) value(node);
	} else if (name === 'class' && !isSvg) {
		node.className = value || '';
	} else if (name === 'style') {
		if (!value || typeof value === 'string' || typeof old === 'string') {
			node.style.cssText = value || '';
		}
		if (value && typeof value === 'object') {
			if (typeof old !== 'string') {
				for (var i in old) {
					if (!(i in value)) node.style[i] = '';
				}
			}
			for (var i in value) {
				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
			}
		}
	} else if (name === 'dangerouslySetInnerHTML') {
		if (value) node.innerHTML = value.__html || '';
	} else if (name[0] == 'o' && name[1] == 'n') {
		var useCapture = name !== (name = name.replace(/Capture$/, ''));
		name = name.toLowerCase().substring(2);
		if (value) {
			if (!old) node.addEventListener(name, eventProxy, useCapture);
		} else {
			node.removeEventListener(name, eventProxy, useCapture);
		}
		(node._listeners || (node._listeners = {}))[name] = value;
	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
		try {
			node[name] = value == null ? '' : value;
		} catch (e) {}
		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	} else {
		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

		if (value == null || value === false) {
			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
		} else if (typeof value !== 'function') {
			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
		}
	}
}

function eventProxy(e) {
	return this._listeners[e.type](options.event && options.event(e) || e);
}

var mounts = [];

var diffLevel = 0;

var isSvgMode = false;

var hydrating = false;

function flushMounts() {
	var c;
	while (c = mounts.pop()) {
		if (options.afterMount) options.afterMount(c);
		if (c.componentDidMount) c.componentDidMount();
	}
}

function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	if (!diffLevel++) {
		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

		hydrating = dom != null && !('__preactattr_' in dom);
	}

	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	if (! --diffLevel) {
		hydrating = false;

		if (!componentRoot) flushMounts();
	}

	return ret;
}

function idiff(dom, vnode, context, mountAll, componentRoot) {
	var out = dom,
	    prevSvgMode = isSvgMode;

	if (vnode == null || typeof vnode === 'boolean') vnode = '';

	if (typeof vnode === 'string' || typeof vnode === 'number') {
		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
			if (dom.nodeValue != vnode) {
				dom.nodeValue = vnode;
			}
		} else {
			out = document.createTextNode(vnode);
			if (dom) {
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
				recollectNodeTree(dom, true);
			}
		}

		out['__preactattr_'] = true;

		return out;
	}

	var vnodeName = vnode.nodeName;
	if (typeof vnodeName === 'function') {
		return buildComponentFromVNode(dom, vnode, context, mountAll);
	}

	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

	vnodeName = String(vnodeName);
	if (!dom || !isNamedNode(dom, vnodeName)) {
		out = createNode(vnodeName, isSvgMode);

		if (dom) {
			while (dom.firstChild) {
				out.appendChild(dom.firstChild);
			}
			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

			recollectNodeTree(dom, true);
		}
	}

	var fc = out.firstChild,
	    props = out['__preactattr_'],
	    vchildren = vnode.children;

	if (props == null) {
		props = out['__preactattr_'] = {};
		for (var a = out.attributes, i = a.length; i--;) {
			props[a[i].name] = a[i].value;
		}
	}

	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
		if (fc.nodeValue != vchildren[0]) {
			fc.nodeValue = vchildren[0];
		}
	} else if (vchildren && vchildren.length || fc != null) {
			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
		}

	diffAttributes(out, vnode.attributes, props);

	isSvgMode = prevSvgMode;

	return out;
}

function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	var originalChildren = dom.childNodes,
	    children = [],
	    keyed = {},
	    keyedLen = 0,
	    min = 0,
	    len = originalChildren.length,
	    childrenLen = 0,
	    vlen = vchildren ? vchildren.length : 0,
	    j,
	    c,
	    f,
	    vchild,
	    child;

	if (len !== 0) {
		for (var i = 0; i < len; i++) {
			var _child = originalChildren[i],
			    props = _child['__preactattr_'],
			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
			if (key != null) {
				keyedLen++;
				keyed[key] = _child;
			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
				children[childrenLen++] = _child;
			}
		}
	}

	if (vlen !== 0) {
		for (var i = 0; i < vlen; i++) {
			vchild = vchildren[i];
			child = null;

			var key = vchild.key;
			if (key != null) {
				if (keyedLen && keyed[key] !== undefined) {
					child = keyed[key];
					keyed[key] = undefined;
					keyedLen--;
				}
			} else if (min < childrenLen) {
					for (j = min; j < childrenLen; j++) {
						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
							child = c;
							children[j] = undefined;
							if (j === childrenLen - 1) childrenLen--;
							if (j === min) min++;
							break;
						}
					}
				}

			child = idiff(child, vchild, context, mountAll);

			f = originalChildren[i];
			if (child && child !== dom && child !== f) {
				if (f == null) {
					dom.appendChild(child);
				} else if (child === f.nextSibling) {
					removeNode(f);
				} else {
					dom.insertBefore(child, f);
				}
			}
		}
	}

	if (keyedLen) {
		for (var i in keyed) {
			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
		}
	}

	while (min <= childrenLen) {
		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	}
}

function recollectNodeTree(node, unmountOnly) {
	var component = node._component;
	if (component) {
		unmountComponent(component);
	} else {
		if (node['__preactattr_'] != null && node['__preactattr_'].ref) node['__preactattr_'].ref(null);

		if (unmountOnly === false || node['__preactattr_'] == null) {
			removeNode(node);
		}

		removeChildren(node);
	}
}

function removeChildren(node) {
	node = node.lastChild;
	while (node) {
		var next = node.previousSibling;
		recollectNodeTree(node, true);
		node = next;
	}
}

function diffAttributes(dom, attrs, old) {
	var name;

	for (name in old) {
		if (!(attrs && attrs[name] != null) && old[name] != null) {
			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
		}
	}

	for (name in attrs) {
		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
		}
	}
}

var recyclerComponents = [];

function createComponent(Ctor, props, context) {
	var inst,
	    i = recyclerComponents.length;

	if (Ctor.prototype && Ctor.prototype.render) {
		inst = new Ctor(props, context);
		Component.call(inst, props, context);
	} else {
		inst = new Component(props, context);
		inst.constructor = Ctor;
		inst.render = doRender;
	}

	while (i--) {
		if (recyclerComponents[i].constructor === Ctor) {
			inst.nextBase = recyclerComponents[i].nextBase;
			recyclerComponents.splice(i, 1);
			return inst;
		}
	}

	return inst;
}

function doRender(props, state, context) {
	return this.constructor(props, context);
}

function setComponentProps(component, props, renderMode, context, mountAll) {
	if (component._disable) return;
	component._disable = true;

	component.__ref = props.ref;
	component.__key = props.key;
	delete props.ref;
	delete props.key;

	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
		if (!component.base || mountAll) {
			if (component.componentWillMount) component.componentWillMount();
		} else if (component.componentWillReceiveProps) {
			component.componentWillReceiveProps(props, context);
		}
	}

	if (context && context !== component.context) {
		if (!component.prevContext) component.prevContext = component.context;
		component.context = context;
	}

	if (!component.prevProps) component.prevProps = component.props;
	component.props = props;

	component._disable = false;

	if (renderMode !== 0) {
		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
			renderComponent(component, 1, mountAll);
		} else {
			enqueueRender(component);
		}
	}

	if (component.__ref) component.__ref(component);
}

function renderComponent(component, renderMode, mountAll, isChild) {
	if (component._disable) return;

	var props = component.props,
	    state = component.state,
	    context = component.context,
	    previousProps = component.prevProps || props,
	    previousState = component.prevState || state,
	    previousContext = component.prevContext || context,
	    isUpdate = component.base,
	    nextBase = component.nextBase,
	    initialBase = isUpdate || nextBase,
	    initialChildComponent = component._component,
	    skip = false,
	    snapshot = previousContext,
	    rendered,
	    inst,
	    cbase;

	if (component.constructor.getDerivedStateFromProps) {
		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
		component.state = state;
	}

	if (isUpdate) {
		component.props = previousProps;
		component.state = previousState;
		component.context = previousContext;
		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
			skip = true;
		} else if (component.componentWillUpdate) {
			component.componentWillUpdate(props, state, context);
		}
		component.props = props;
		component.state = state;
		component.context = context;
	}

	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	component._dirty = false;

	if (!skip) {
		rendered = component.render(props, state, context);

		if (component.getChildContext) {
			context = extend(extend({}, context), component.getChildContext());
		}

		if (isUpdate && component.getSnapshotBeforeUpdate) {
			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
		}

		var childComponent = rendered && rendered.nodeName,
		    toUnmount,
		    base;

		if (typeof childComponent === 'function') {

			var childProps = getNodeProps(rendered);
			inst = initialChildComponent;

			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
				setComponentProps(inst, childProps, 1, context, false);
			} else {
				toUnmount = inst;

				component._component = inst = createComponent(childComponent, childProps, context);
				inst.nextBase = inst.nextBase || nextBase;
				inst._parentComponent = component;
				setComponentProps(inst, childProps, 0, context, false);
				renderComponent(inst, 1, mountAll, true);
			}

			base = inst.base;
		} else {
			cbase = initialBase;

			toUnmount = initialChildComponent;
			if (toUnmount) {
				cbase = component._component = null;
			}

			if (initialBase || renderMode === 1) {
				if (cbase) cbase._component = null;
				base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
			}
		}

		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
			var baseParent = initialBase.parentNode;
			if (baseParent && base !== baseParent) {
				baseParent.replaceChild(base, initialBase);

				if (!toUnmount) {
					initialBase._component = null;
					recollectNodeTree(initialBase, false);
				}
			}
		}

		if (toUnmount) {
			unmountComponent(toUnmount);
		}

		component.base = base;
		if (base && !isChild) {
			var componentRef = component,
			    t = component;
			while (t = t._parentComponent) {
				(componentRef = t).base = base;
			}
			base._component = componentRef;
			base._componentConstructor = componentRef.constructor;
		}
	}

	if (!isUpdate || mountAll) {
		mounts.unshift(component);
	} else if (!skip) {

		if (component.componentDidUpdate) {
			component.componentDidUpdate(previousProps, previousState, snapshot);
		}
		if (options.afterUpdate) options.afterUpdate(component);
	}

	while (component._renderCallbacks.length) {
		component._renderCallbacks.pop().call(component);
	}if (!diffLevel && !isChild) flushMounts();
}

function buildComponentFromVNode(dom, vnode, context, mountAll) {
	var c = dom && dom._component,
	    originalComponent = c,
	    oldDom = dom,
	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	    isOwner = isDirectOwner,
	    props = getNodeProps(vnode);
	while (c && !isOwner && (c = c._parentComponent)) {
		isOwner = c.constructor === vnode.nodeName;
	}

	if (c && isOwner && (!mountAll || c._component)) {
		setComponentProps(c, props, 3, context, mountAll);
		dom = c.base;
	} else {
		if (originalComponent && !isDirectOwner) {
			unmountComponent(originalComponent);
			dom = oldDom = null;
		}

		c = createComponent(vnode.nodeName, props, context);
		if (dom && !c.nextBase) {
			c.nextBase = dom;

			oldDom = null;
		}
		setComponentProps(c, props, 1, context, mountAll);
		dom = c.base;

		if (oldDom && dom !== oldDom) {
			oldDom._component = null;
			recollectNodeTree(oldDom, false);
		}
	}

	return dom;
}

function unmountComponent(component) {
	if (options.beforeUnmount) options.beforeUnmount(component);

	var base = component.base;

	component._disable = true;

	if (component.componentWillUnmount) component.componentWillUnmount();

	component.base = null;

	var inner = component._component;
	if (inner) {
		unmountComponent(inner);
	} else if (base) {
		if (base['__preactattr_'] && base['__preactattr_'].ref) base['__preactattr_'].ref(null);

		component.nextBase = base;

		removeNode(base);
		recyclerComponents.push(component);

		removeChildren(base);
	}

	if (component.__ref) component.__ref(null);
}

function Component(props, context) {
	this._dirty = true;

	this.context = context;

	this.props = props;

	this.state = this.state || {};

	this._renderCallbacks = [];
}

extend(Component.prototype, {
	setState: function setState(state, callback) {
		if (!this.prevState) this.prevState = this.state;
		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	},
	forceUpdate: function forceUpdate(callback) {
		if (callback) this._renderCallbacks.push(callback);
		renderComponent(this, 2);
	},
	render: function render() {}
});

function render(vnode, parent, merge) {
  return diff(merge, vnode, {}, false, parent, false);
}

var preact = {
	h: h,
	createElement: h,
	cloneElement: cloneElement,
	Component: Component,
	render: render,
	rerender: rerender,
	options: options
};

/* harmony default export */ __webpack_exports__["default"] = (preact);

//# sourceMappingURL=preact.mjs.map


/***/ }),

/***/ "./node_modules/redux-zero/dist/redux-zero.js":
/*!****************************************************!*\
  !*** ./node_modules/redux-zero/dist/redux-zero.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function createStore$1(state, middleware) {
    if (state === void 0) { state = {}; }
    if (middleware === void 0) { middleware = null; }
    var listeners = [];
    return {
        middleware: middleware,
        setState: function (update) {
            state =
                typeof update === "function"
                    ? __assign({}, state, update(state)) : __assign({}, state, update);
            listeners.forEach(function (f) { return f(state); });
        },
        subscribe: function (f) {
            listeners.push(f);
            return function () {
                listeners.splice(listeners.indexOf(f), 1);
            };
        },
        getState: function () {
            return state;
        },
        reset: function () {
            state = {};
        }
    };
}

module.exports = createStore$1;


/***/ }),

/***/ "./node_modules/redux-zero/preact/index.js":
/*!*************************************************!*\
  !*** ./node_modules/redux-zero/preact/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var preact = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function shallowEqual(a, b) {
    for (var i in a)
        if (a[i] !== b[i])
            return false;
    for (var i in b)
        if (!(i in a))
            return false;
    return true;
}

function set(store, ret) {
    if (ret != null) {
        if (ret.then)
            return ret.then(store.setState);
        store.setState(ret);
    }
}

function bindActions(actions, store, ownProps) {
    actions = typeof actions === "function" ? actions(store, ownProps) : actions;
    var bound = {};
    var _loop_1 = function (name_1) {
        bound[name_1] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var action = actions[name_1];
            if (typeof store.middleware === "function") {
                return store.middleware(store, action, args);
            }
            return set(store, action.apply(void 0, [store.getState()].concat(args)));
        };
    };
    for (var name_1 in actions) {
        _loop_1(name_1);
    }
    return bound;
}

var Connect = /** @class */ (function (_super) {
    __extends(Connect, _super);
    function Connect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = _this.getProps();
        _this.actions = _this.getActions();
        _this.update = function () {
            var mapped = _this.getProps();
            if (!shallowEqual(mapped, _this.state)) {
                _this.setState(mapped);
            }
        };
        return _this;
    }
    Connect.prototype.componentWillMount = function () {
        this.unsubscribe = this.context.store.subscribe(this.update);
    };
    Connect.prototype.componentWillUnmount = function () {
        this.unsubscribe(this.update);
    };
    Connect.prototype.getProps = function () {
        var mapToProps = this.props.mapToProps;
        var state = (this.context.store && this.context.store.getState()) || {};
        return mapToProps ? mapToProps(state, this.props) : state;
    };
    Connect.prototype.getActions = function () {
        var actions = this.props.actions;
        return bindActions(actions, this.context.store, this.props);
    };
    Connect.prototype.render = function (_a, state, _b) {
        var children = _a.children;
        var store = _b.store;
        return children[0](__assign({ store: store }, state, this.actions));
    };
    return Connect;
}(preact.Component));
// [ HACK ] to avoid Typechecks
// since there is a small conflict between preact and react typings
// in the future this might become unecessary by updating typings
var ConnectUntyped = Connect;
function connect(mapToProps, actions) {
    if (actions === void 0) { actions = {}; }
    return function (Child) {
        return /** @class */ (function (_super) {
            __extends(ConnectWrapper, _super);
            function ConnectWrapper() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ConnectWrapper.prototype.render = function () {
                var props = this.props;
                return (preact.h(ConnectUntyped, __assign({}, props, { mapToProps: mapToProps, actions: actions }), function (mappedProps) { return preact.h(Child, __assign({}, mappedProps, props)); }));
            };
            return ConnectWrapper;
        }(preact.Component));
    };
}

var Provider = /** @class */ (function (_super) {
    __extends(Provider, _super);
    function Provider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Provider.prototype.getChildContext = function () {
        return { store: this.props.store };
    };
    Provider.prototype.render = function () {
        return this.props.children[0];
    };
    return Provider;
}(preact.Component));

exports.connect = connect;
exports.Provider = Provider;
exports.Connect = Connect;


/***/ }),

/***/ "./preview-src/App.tsx":
/*!*****************************!*\
  !*** ./preview-src/App.tsx ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-zero/preact */ "./node_modules/redux-zero/preact/index.js");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./messaging */ "./preview-src/messaging/index.ts");
/* harmony import */ var _containers_ToolbarContainer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./containers/ToolbarContainer */ "./preview-src/containers/ToolbarContainer.tsx");
/* harmony import */ var _containers_PreviewContainer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./containers/PreviewContainer */ "./preview-src/containers/PreviewContainer.tsx");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./store */ "./preview-src/store/index.ts");






const mapToProps = (state) => ({ source: state.source });
class App extends preact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    componentDidMount() {
        _messaging__WEBPACK_IMPORTED_MODULE_2__["default"].addListener('source:update', this.props.updateSource);
    }
    componentWillUnmount() {
        _messaging__WEBPACK_IMPORTED_MODULE_2__["default"].removeListener('source:update', this.props.updateSource);
    }
    render() {
        return (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "layout" },
            Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_containers_ToolbarContainer__WEBPACK_IMPORTED_MODULE_3__["default"], null),
            this.props.source.data && Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_containers_PreviewContainer__WEBPACK_IMPORTED_MODULE_4__["default"], null)));
    }
}
/* harmony default export */ __webpack_exports__["default"] = (Object(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapToProps, _store__WEBPACK_IMPORTED_MODULE_5__["actions"])(App));


/***/ }),

/***/ "./preview-src/components/Preview.tsx":
/*!********************************************!*\
  !*** ./preview-src/components/Preview.tsx ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");

const Preview = ({ data, attachRef, dimension: { width, height, units }, onWheel, background, settings }) => {
    const styles = {
        width: `${width}${units}`,
        minWidth: `${width}${units}`,
        height: `${height}${units}`,
        minHeight: `${height}${units}`
    };
    return (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: `preview ${background} ${settings.showBoundingBox ? 'bounding-box' : ''}`, onWheel: onWheel },
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: `data:image/svg+xml,${encodeURIComponent(data)}`, ref: attachRef, style: styles, alt: "" })));
};
/* harmony default export */ __webpack_exports__["default"] = (Preview);


/***/ }),

/***/ "./preview-src/components/PreviewError.tsx":
/*!*************************************************!*\
  !*** ./preview-src/components/PreviewError.tsx ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");

const PreviewError = () => (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "error-container" },
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("img", { src: "vscode-resource:error.png" }),
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null,
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, "Image Not Loaded"),
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", null, "Try to open it externally to fix format problem"))));
/* harmony default export */ __webpack_exports__["default"] = (PreviewError);


/***/ }),

/***/ "./preview-src/components/Toolbar.tsx":
/*!********************************************!*\
  !*** ./preview-src/components/Toolbar.tsx ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");

const Toolbar = ({ onChangeBackgroundButtonClick, zoomIn, zoomOut, zoomReset, fileSize, sourceImageValidity, onBtnMouseDown, activeBtn }) => (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "toolbar" },
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "btn-group" },
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { name: "zoom-in", className: `reset-button btn btn-plus ${activeBtn === 'zoom-in' ? 'active' : ''}`, disabled: !sourceImageValidity, onClick: zoomIn, onMouseDown: onBtnMouseDown }),
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { name: "zoom-out", className: `reset-button btn btn-minus ${activeBtn === 'zoom-out' ? 'active' : ''}`, disabled: !sourceImageValidity, onClick: zoomOut, onMouseDown: onBtnMouseDown }),
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { name: "reset", className: `reset-button btn btn-one-to-one ${activeBtn === 'reset' ? 'active' : ''}`, disabled: !sourceImageValidity, onClick: zoomReset, onMouseDown: onBtnMouseDown })),
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "separator" }),
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "bg-group" },
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: `bg-container ${activeBtn === 'dark' ? 'selected' : ''}` },
            Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { disabled: !sourceImageValidity, className: "reset-button bg dark", name: "dark", onClick: onChangeBackgroundButtonClick, onMouseDown: onBtnMouseDown })),
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: `bg-container ${activeBtn === 'light' ? 'selected' : ''}` },
            Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { disabled: !sourceImageValidity, className: "reset-button bg light", name: "light", onClick: onChangeBackgroundButtonClick, onMouseDown: onBtnMouseDown })),
        Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: `bg-container ${activeBtn === 'transparent' ? 'selected' : ''}` },
            Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("button", { disabled: !sourceImageValidity, className: "reset-button bg transparent", name: "transparent", onClick: onChangeBackgroundButtonClick, onMouseDown: onBtnMouseDown }))),
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", { className: "size" }, fileSize)));
/* harmony default export */ __webpack_exports__["default"] = (Toolbar);


/***/ }),

/***/ "./preview-src/containers/PreviewContainer.tsx":
/*!*****************************************************!*\
  !*** ./preview-src/containers/PreviewContainer.tsx ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-zero/preact */ "./node_modules/redux-zero/preact/index.js");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../store */ "./preview-src/store/index.ts");
/* harmony import */ var _components_Preview__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/Preview */ "./preview-src/components/Preview.tsx");
/* harmony import */ var _components_PreviewError__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/PreviewError */ "./preview-src/components/PreviewError.tsx");
/* harmony import */ var _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../messaging/telemetry */ "./preview-src/messaging/telemetry.ts");






const NEW_LINE_REGEXP = /[\r\n]+/g;
const SVG_TAG_REGEXP = /<svg.+?>/;
const WIDTH_REGEXP = /width=("|')([0-9.,]+)\w*("|')/;
const HEIGHT_REGEXP = /height=("|')([0-9.,]+)\w*("|')/;
class PreviewContainer extends preact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props) {
        super(props);
        this.attachRef = (el) => {
            this.imageEl = el;
        };
        this.onWheel = (event) => {
            if (!(event.ctrlKey || event.metaKey)) {
                return;
            }
            event.preventDefault();
            let delta = Math.sign(event.wheelDelta);
            if (delta === 1) {
                this.props.zoomIn();
                _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__["default"].sendZoomEvent('in', 'mousewheel');
            }
            if (delta === -1) {
                this.props.zoomOut();
                _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__["default"].sendZoomEvent('out', 'mousewheel');
            }
        };
        this.onError = () => {
            this.setState({ showPreviewError: true });
            this.props.toggleSourceImageValidity(false);
        };
        this.onLoad = () => {
            this.setState({ showPreviewError: false });
            this.props.toggleSourceImageValidity(true);
        };
        this.state = { showPreviewError: false };
    }
    componentDidMount() {
        this.imageEl.addEventListener('error', this.onError);
        this.imageEl.addEventListener('load', this.onLoad);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.source.data !== this.props.source.data) {
            this.setState({ showPreviewError: false });
        }
    }
    getOriginalDimension(data) {
        const formatted = data.replace(NEW_LINE_REGEXP, ' ');
        const svg = formatted.match(SVG_TAG_REGEXP);
        let width = null, height = null;
        if (svg && svg.length) {
            width = svg[0].match(WIDTH_REGEXP) ? svg[0].match(WIDTH_REGEXP)[2] : null;
            height = svg[0].match(HEIGHT_REGEXP) ? svg[0].match(HEIGHT_REGEXP)[2] : null;
        }
        return width && height ? { width: parseFloat(width), height: parseFloat(width) } : null;
    }
    getScaledDimension() {
        const originalDimension = this.getOriginalDimension(this.props.source.data);
        const originalWidth = originalDimension ? originalDimension.width : 100;
        const originalHeight = originalDimension ? originalDimension.height : 100;
        const units = originalDimension ? 'px' : '%';
        return {
            width: parseInt((originalWidth * this.props.scale).toString()),
            height: parseInt((originalHeight * this.props.scale).toString()),
            units
        };
    }
    render() {
        return this.state.showPreviewError ?
            Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_components_PreviewError__WEBPACK_IMPORTED_MODULE_4__["default"], null) :
            (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_components_Preview__WEBPACK_IMPORTED_MODULE_3__["default"], { data: this.props.source.data, attachRef: this.attachRef, dimension: this.getScaledDimension(), onWheel: this.onWheel, background: this.props.background, settings: this.props.source.settings }));
    }
}
const mapToProps = (state) => ({ source: state.source, scale: state.scale, background: state.background });
/* harmony default export */ __webpack_exports__["default"] = (Object(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapToProps, _store__WEBPACK_IMPORTED_MODULE_2__["actions"])(PreviewContainer));


/***/ }),

/***/ "./preview-src/containers/ToolbarContainer.tsx":
/*!*****************************************************!*\
  !*** ./preview-src/containers/ToolbarContainer.tsx ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-zero/preact */ "./node_modules/redux-zero/preact/index.js");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Toolbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Toolbar */ "./preview-src/components/Toolbar.tsx");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../store */ "./preview-src/store/index.ts");
/* harmony import */ var _utils_fileSize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/fileSize */ "./preview-src/utils/fileSize.ts");
/* harmony import */ var _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../messaging/telemetry */ "./preview-src/messaging/telemetry.ts");






const SCALE_STEP = 0.5;
class ToolbarContainer extends preact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor() {
        super(...arguments);
        this.onChangeBackgroundButtonClick = (e) => {
            this.props.changeBackground(e.srcElement.getAttribute('name'));
        };
        this.onBtnMouseDown = (e) => {
            this.setState({ activeBtn: e.currentTarget.name });
        };
        this.onBtnMouseUp = () => {
            this.setState({ activeBtn: '' });
        };
        this.zoomIn = () => {
            this.props.zoomIn(SCALE_STEP);
            _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__["default"].sendZoomEvent('in', 'toolbar');
        };
        this.zoomOut = () => {
            this.props.zoomOut(SCALE_STEP);
            _messaging_telemetry__WEBPACK_IMPORTED_MODULE_5__["default"].sendZoomEvent('out', 'toolbar');
        };
    }
    componentDidMount() {
        window.document.addEventListener('mouseup', this.onBtnMouseUp);
    }
    componentWillUnmount() {
        window.document.removeEventListener('mouseup', this.onBtnMouseUp);
    }
    getFileSize() {
        return this.props.source.data ? Object(_utils_fileSize__WEBPACK_IMPORTED_MODULE_4__["humanFileSize"])(Object(_utils_fileSize__WEBPACK_IMPORTED_MODULE_4__["getByteCountByContent"])(this.props.source.data)) : '0 B';
    }
    render() {
        return (Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_components_Toolbar__WEBPACK_IMPORTED_MODULE_2__["default"], { onChangeBackgroundButtonClick: this.onChangeBackgroundButtonClick, zoomIn: this.zoomIn, zoomOut: this.zoomOut, zoomReset: this.props.zoomReset, fileSize: this.getFileSize(), sourceImageValidity: this.props.sourceImageValidity, onBtnMouseDown: this.onBtnMouseDown, activeBtn: this.state.activeBtn }));
    }
}
const mapToProps = (state) => ({ source: state.source, sourceImageValidity: state.sourceImageValidity });
/* harmony default export */ __webpack_exports__["default"] = (Object(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapToProps, _store__WEBPACK_IMPORTED_MODULE_3__["actions"])(ToolbarContainer));


/***/ }),

/***/ "./preview-src/index.tsx":
/*!*******************************!*\
  !*** ./preview-src/index.tsx ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./node_modules/preact/dist/preact.mjs");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-zero/preact */ "./node_modules/redux-zero/preact/index.js");
/* harmony import */ var redux_zero_preact__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./App */ "./preview-src/App.tsx");
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./store */ "./preview-src/store/index.ts");
/* harmony import */ var _messaging__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./messaging */ "./preview-src/messaging/index.ts");





Object(preact__WEBPACK_IMPORTED_MODULE_0__["render"])(Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(redux_zero_preact__WEBPACK_IMPORTED_MODULE_1__["Provider"], { store: _store__WEBPACK_IMPORTED_MODULE_3__["default"] },
    Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_App__WEBPACK_IMPORTED_MODULE_2__["default"], null)), document.querySelector('body'));


/***/ }),

/***/ "./preview-src/messaging/index.ts":
/*!****************************************!*\
  !*** ./preview-src/messaging/index.ts ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _vscode_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vscode-api */ "./preview-src/vscode-api/index.ts");


class MessageBroker extends events__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"] {
    constructor() {
        super();
        window.addEventListener('message', event => {
            const { command, payload } = event.data;
            this.emit(command, payload);
        });
    }
    send(message) {
        _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].postMessage(message);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (new MessageBroker());


/***/ }),

/***/ "./preview-src/messaging/telemetry.ts":
/*!********************************************!*\
  !*** ./preview-src/messaging/telemetry.ts ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ */ "./preview-src/messaging/index.ts");

const TELEMETRY_EVENT_ZOOM = 'zoom';
const TELEMETRY_EVENT_CHANGE_BACKGROUND = 'changeBackground';
class TelemetryReporter {
    sendZoomEvent(type, source) {
        ___WEBPACK_IMPORTED_MODULE_0__["default"].send({
            command: 'sendTelemetryEvent',
            payload: {
                eventName: TELEMETRY_EVENT_ZOOM,
                properties: { type, source }
            }
        });
    }
    sendChangeBackgroundEvent(from, to) {
        ___WEBPACK_IMPORTED_MODULE_0__["default"].send({
            command: 'sendTelemetryEvent',
            payload: {
                eventName: TELEMETRY_EVENT_CHANGE_BACKGROUND,
                properties: { from, to }
            }
        });
    }
}
/* harmony default export */ __webpack_exports__["default"] = (new TelemetryReporter());


/***/ }),

/***/ "./preview-src/store/actions.ts":
/*!**************************************!*\
  !*** ./preview-src/store/actions.ts ***!
  \**************************************/
/*! exports provided: actions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "actions", function() { return actions; });
/* harmony import */ var _vscode_api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vscode-api */ "./preview-src/vscode-api/index.ts");
/* harmony import */ var _messaging_telemetry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../messaging/telemetry */ "./preview-src/messaging/telemetry.ts");


const DEFAULT_SCALE_STEP = 0.2;
const MIN_SCALE = 0.1;
const MAX_SCALE = 20;
const actions = () => ({
    updateSource: (state, source) => {
        _vscode_api__WEBPACK_IMPORTED_MODULE_0__["default"].setState(source);
        return Object.assign({}, state, { source, scale: 1 });
    },
    zoomIn: (state, step = DEFAULT_SCALE_STEP) => {
        const nextScale = state.scale + state.scale * step;
        return Object.assign({}, state, { scale: nextScale <= MAX_SCALE ? nextScale : MAX_SCALE });
    },
    zoomOut: (state, step = DEFAULT_SCALE_STEP) => {
        const nextScale = state.scale - state.scale * step;
        return Object.assign({}, state, { scale: nextScale >= MIN_SCALE ? nextScale : MIN_SCALE });
    },
    zoomReset: (state) => {
        _messaging_telemetry__WEBPACK_IMPORTED_MODULE_1__["default"].sendZoomEvent('reset', 'toolbar');
        return Object.assign({}, state, { scale: 1 });
    },
    changeBackground: (state, background) => {
        _messaging_telemetry__WEBPACK_IMPORTED_MODULE_1__["default"].sendChangeBackgroundEvent(state.background, background);
        return Object.assign({}, state, { background });
    },
    toggleSourceImageValidity: (state, validity) => (Object.assign({}, state, { sourceImageValidity: validity }))
});


/***/ }),

/***/ "./preview-src/store/index.ts":
/*!************************************!*\
  !*** ./preview-src/store/index.ts ***!
  \************************************/
/*! exports provided: default, actions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var redux_zero__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux-zero */ "./node_modules/redux-zero/dist/redux-zero.js");
/* harmony import */ var redux_zero__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(redux_zero__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _vscode_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vscode-api */ "./preview-src/vscode-api/index.ts");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./actions */ "./preview-src/store/actions.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "actions", function() { return _actions__WEBPACK_IMPORTED_MODULE_2__["actions"]; });



const initialState = {
    source: {
        uri: _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState() ? _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState().uri : null,
        data: _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState() ? _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState().data : null,
        settings: _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState() ? _vscode_api__WEBPACK_IMPORTED_MODULE_1__["default"].getState().settings : { showBoundingBox: false }
    },
    scale: 1,
    background: document.querySelector('body').classList.contains('vscode-dark') ? 'dark' : 'light',
    sourceImageValidity: false,
};
/* harmony default export */ __webpack_exports__["default"] = (redux_zero__WEBPACK_IMPORTED_MODULE_0___default()(initialState));



/***/ }),

/***/ "./preview-src/utils/fileSize.ts":
/*!***************************************!*\
  !*** ./preview-src/utils/fileSize.ts ***!
  \***************************************/
/*! exports provided: getByteCountByContent, humanFileSize */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getByteCountByContent", function() { return getByteCountByContent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "humanFileSize", function() { return humanFileSize; });
function getByteCountByContent(s = '') {
    let count = 0, stringLength = s.length, i;
    s = String(s || '');
    for (i = 0; i < stringLength; i++) {
        const partCount = encodeURI(s[i]).split('%').length;
        count += partCount === 1 ? 1 : partCount - 1;
    }
    return count;
}
function humanFileSize(size = 0) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    const numberPart = +(size / Math.pow(1024, i)).toFixed(2) * 1;
    const stringPart = ['B', 'kB', 'MB', 'GB', 'TB'][i];
    return `${numberPart} ${stringPart}`;
}
;


/***/ }),

/***/ "./preview-src/vscode-api/index.ts":
/*!*****************************************!*\
  !*** ./preview-src/vscode-api/index.ts ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (acquireVsCodeApi());


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3JlZHV4LXplcm8vZGlzdC9yZWR1eC16ZXJvLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yZWR1eC16ZXJvL3ByZWFjdC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wcmV2aWV3LXNyYy9BcHAudHN4Iiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL2NvbXBvbmVudHMvUHJldmlldy50c3giLCJ3ZWJwYWNrOi8vLy4vcHJldmlldy1zcmMvY29tcG9uZW50cy9QcmV2aWV3RXJyb3IudHN4Iiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL2NvbXBvbmVudHMvVG9vbGJhci50c3giLCJ3ZWJwYWNrOi8vLy4vcHJldmlldy1zcmMvY29udGFpbmVycy9QcmV2aWV3Q29udGFpbmVyLnRzeCIsIndlYnBhY2s6Ly8vLi9wcmV2aWV3LXNyYy9jb250YWluZXJzL1Rvb2xiYXJDb250YWluZXIudHN4Iiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL2luZGV4LnRzeCIsIndlYnBhY2s6Ly8vLi9wcmV2aWV3LXNyYy9tZXNzYWdpbmcvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vcHJldmlldy1zcmMvbWVzc2FnaW5nL3RlbGVtZXRyeS50cyIsIndlYnBhY2s6Ly8vLi9wcmV2aWV3LXNyYy9zdG9yZS9hY3Rpb25zLnRzIiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL3N0b3JlL2luZGV4LnRzIiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL3V0aWxzL2ZpbGVTaXplLnRzIiwid2VicGFjazovLy8uL3ByZXZpZXctc3JjL3ZzY29kZS1hcGkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLGVBQWUsU0FBUztBQUN4QjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsR0FBRztBQUNILG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN1NBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsU0FBUztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLEtBQUs7QUFDOUI7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBLGtDQUFrQywwREFBMEQ7QUFDNUY7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0EsMkNBQTJDO0FBQzNDOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCO0FBQ3RCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLDJDQUEyQztBQUMzQyxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBLHNGQUFzRjtBQUN0RixHQUFHO0FBQ0gsMEZBQTBGO0FBQzFGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDLEtBQUs7QUFDakQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIsVUFBVTtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNkI7QUFDN0I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWUscUVBQU0sRUFBQztBQUMrRDtBQUNyRjs7Ozs7Ozs7Ozs7OztBQzFzQmE7O0FBRWI7QUFDQTtBQUNBLCtEQUErRDtBQUMvRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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RyxDQUFDLEdBQUcsWUFBWSxFQUFHLENBQUMsRUFBRSxFQUNuQztRQUNFLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3RELEtBQUssSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsVUFBUyxHQUFDLENBQUMsQ0FBQztLQUMxQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVNLHVCQUF1QixPQUFlLENBQUM7SUFDMUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztJQUN0RCxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRSxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRCxPQUFPLEdBQUcsVUFBVSxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ3pDLENBQUM7QUFBQSxDQUFDOzs7Ozs7Ozs7Ozs7O0FDUkY7QUFBZSwrRUFBZ0IsRUFBRSxFQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9wcmV2aWV3LXNyYy9pbmRleC50c3hcIik7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJ2YXIgVk5vZGUgPSBmdW5jdGlvbiBWTm9kZSgpIHt9O1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG52YXIgc3RhY2sgPSBbXTtcblxudmFyIEVNUFRZX0NISUxEUkVOID0gW107XG5cbmZ1bmN0aW9uIGgobm9kZU5hbWUsIGF0dHJpYnV0ZXMpIHtcblx0dmFyIGNoaWxkcmVuID0gRU1QVFlfQ0hJTERSRU4sXG5cdCAgICBsYXN0U2ltcGxlLFxuXHQgICAgY2hpbGQsXG5cdCAgICBzaW1wbGUsXG5cdCAgICBpO1xuXHRmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOykge1xuXHRcdHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcblx0fVxuXHRpZiAoYXR0cmlidXRlcyAmJiBhdHRyaWJ1dGVzLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcblx0XHRkZWxldGUgYXR0cmlidXRlcy5jaGlsZHJlbjtcblx0fVxuXHR3aGlsZSAoc3RhY2subGVuZ3RoKSB7XG5cdFx0aWYgKChjaGlsZCA9IHN0YWNrLnBvcCgpKSAmJiBjaGlsZC5wb3AgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yIChpID0gY2hpbGQubGVuZ3RoOyBpLS07KSB7XG5cdFx0XHRcdHN0YWNrLnB1c2goY2hpbGRbaV0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSAnYm9vbGVhbicpIGNoaWxkID0gbnVsbDtcblxuXHRcdFx0aWYgKHNpbXBsZSA9IHR5cGVvZiBub2RlTmFtZSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRpZiAoY2hpbGQgPT0gbnVsbCkgY2hpbGQgPSAnJztlbHNlIGlmICh0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInKSBjaGlsZCA9IFN0cmluZyhjaGlsZCk7ZWxzZSBpZiAodHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJykgc2ltcGxlID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkge1xuXHRcdFx0XHRjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSArPSBjaGlsZDtcblx0XHRcdH0gZWxzZSBpZiAoY2hpbGRyZW4gPT09IEVNUFRZX0NISUxEUkVOKSB7XG5cdFx0XHRcdGNoaWxkcmVuID0gW2NoaWxkXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuXHRcdFx0fVxuXG5cdFx0XHRsYXN0U2ltcGxlID0gc2ltcGxlO1xuXHRcdH1cblx0fVxuXG5cdHZhciBwID0gbmV3IFZOb2RlKCk7XG5cdHAubm9kZU5hbWUgPSBub2RlTmFtZTtcblx0cC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRwLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzID09IG51bGwgPyB1bmRlZmluZWQgOiBhdHRyaWJ1dGVzO1xuXHRwLmtleSA9IGF0dHJpYnV0ZXMgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IGF0dHJpYnV0ZXMua2V5O1xuXG5cdGlmIChvcHRpb25zLnZub2RlICE9PSB1bmRlZmluZWQpIG9wdGlvbnMudm5vZGUocCk7XG5cblx0cmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGV4dGVuZChvYmosIHByb3BzKSB7XG4gIGZvciAodmFyIGkgaW4gcHJvcHMpIHtcbiAgICBvYmpbaV0gPSBwcm9wc1tpXTtcbiAgfXJldHVybiBvYmo7XG59XG5cbnZhciBkZWZlciA9IHR5cGVvZiBQcm9taXNlID09ICdmdW5jdGlvbicgPyBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpIDogc2V0VGltZW91dDtcblxuZnVuY3Rpb24gY2xvbmVFbGVtZW50KHZub2RlLCBwcm9wcykge1xuICByZXR1cm4gaCh2bm9kZS5ub2RlTmFtZSwgZXh0ZW5kKGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyksIHByb3BzKSwgYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiB2bm9kZS5jaGlsZHJlbik7XG59XG5cbnZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcblxudmFyIGl0ZW1zID0gW107XG5cbmZ1bmN0aW9uIGVucXVldWVSZW5kZXIoY29tcG9uZW50KSB7XG5cdGlmICghY29tcG9uZW50Ll9kaXJ0eSAmJiAoY29tcG9uZW50Ll9kaXJ0eSA9IHRydWUpICYmIGl0ZW1zLnB1c2goY29tcG9uZW50KSA9PSAxKSB7XG5cdFx0KG9wdGlvbnMuZGVib3VuY2VSZW5kZXJpbmcgfHwgZGVmZXIpKHJlcmVuZGVyKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZXJlbmRlcigpIHtcblx0dmFyIHAsXG5cdCAgICBsaXN0ID0gaXRlbXM7XG5cdGl0ZW1zID0gW107XG5cdHdoaWxlIChwID0gbGlzdC5wb3AoKSkge1xuXHRcdGlmIChwLl9kaXJ0eSkgcmVuZGVyQ29tcG9uZW50KHApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGlzU2FtZU5vZGVUeXBlKG5vZGUsIHZub2RlLCBoeWRyYXRpbmcpIHtcblx0aWYgKHR5cGVvZiB2bm9kZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZub2RlID09PSAnbnVtYmVyJykge1xuXHRcdHJldHVybiBub2RlLnNwbGl0VGV4dCAhPT0gdW5kZWZpbmVkO1xuXHR9XG5cdGlmICh0eXBlb2Ygdm5vZGUubm9kZU5hbWUgPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7XG5cdH1cblx0cmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG59XG5cbmZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG5cdHJldHVybiBub2RlLm5vcm1hbGl6ZWROb2RlTmFtZSA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcblx0dmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcblx0cHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcblxuXHR2YXIgZGVmYXVsdFByb3BzID0gdm5vZGUubm9kZU5hbWUuZGVmYXVsdFByb3BzO1xuXHRpZiAoZGVmYXVsdFByb3BzICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykge1xuXHRcdFx0aWYgKHByb3BzW2ldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cHJvcHNbaV0gPSBkZWZhdWx0UHJvcHNbaV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Zykge1xuXHR2YXIgbm9kZSA9IGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuXHRub2RlLm5vcm1hbGl6ZWROb2RlTmFtZSA9IG5vZGVOYW1lO1xuXHRyZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG5cdHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRpZiAocGFyZW50Tm9kZSkgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gc2V0QWNjZXNzb3Iobm9kZSwgbmFtZSwgb2xkLCB2YWx1ZSwgaXNTdmcpIHtcblx0aWYgKG5hbWUgPT09ICdjbGFzc05hbWUnKSBuYW1lID0gJ2NsYXNzJztcblxuXHRpZiAobmFtZSA9PT0gJ2tleScpIHt9IGVsc2UgaWYgKG5hbWUgPT09ICdyZWYnKSB7XG5cdFx0aWYgKG9sZCkgb2xkKG51bGwpO1xuXHRcdGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzJyAmJiAhaXNTdmcpIHtcblx0XHRub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICdzdHlsZScpIHtcblx0XHRpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIG9sZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuXHRcdH1cblx0XHRpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0aWYgKHR5cGVvZiBvbGQgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgaW4gb2xkKSB7XG5cdFx0XHRcdFx0aWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRub2RlLnN0eWxlW2ldID0gdHlwZW9mIHZhbHVlW2ldID09PSAnbnVtYmVyJyAmJiBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA9PT0gZmFsc2UgPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJ2Rhbmdlcm91c2x5U2V0SW5uZXJIVE1MJykge1xuXHRcdGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG5cdH0gZWxzZSBpZiAobmFtZVswXSA9PSAnbycgJiYgbmFtZVsxXSA9PSAnbicpIHtcblx0XHR2YXIgdXNlQ2FwdHVyZSA9IG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9DYXB0dXJlJC8sICcnKSk7XG5cdFx0bmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMik7XG5cdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHRpZiAoIW9sZCkgbm9kZS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG5cdFx0fVxuXHRcdChub2RlLl9saXN0ZW5lcnMgfHwgKG5vZGUuX2xpc3RlbmVycyA9IHt9KSlbbmFtZV0gPSB2YWx1ZTtcblx0fSBlbHNlIGlmIChuYW1lICE9PSAnbGlzdCcgJiYgbmFtZSAhPT0gJ3R5cGUnICYmICFpc1N2ZyAmJiBuYW1lIGluIG5vZGUpIHtcblx0XHR0cnkge1xuXHRcdFx0bm9kZVtuYW1lXSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xuXHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0aWYgKCh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSBmYWxzZSkgJiYgbmFtZSAhPSAnc3BlbGxjaGVjaycpIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbms6Py8sICcnKSk7XG5cblx0XHRpZiAodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gZmFsc2UpIHtcblx0XHRcdGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7ZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0aWYgKG5zKSBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpLCB2YWx1ZSk7ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV2ZW50UHJveHkoZSkge1xuXHRyZXR1cm4gdGhpcy5fbGlzdGVuZXJzW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xufVxuXG52YXIgbW91bnRzID0gW107XG5cbnZhciBkaWZmTGV2ZWwgPSAwO1xuXG52YXIgaXNTdmdNb2RlID0gZmFsc2U7XG5cbnZhciBoeWRyYXRpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG5cdHZhciBjO1xuXHR3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuXHRcdGlmIChvcHRpb25zLmFmdGVyTW91bnQpIG9wdGlvbnMuYWZ0ZXJNb3VudChjKTtcblx0XHRpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuXHRpZiAoIWRpZmZMZXZlbCsrKSB7XG5cdFx0aXNTdmdNb2RlID0gcGFyZW50ICE9IG51bGwgJiYgcGFyZW50Lm93bmVyU1ZHRWxlbWVudCAhPT0gdW5kZWZpbmVkO1xuXG5cdFx0aHlkcmF0aW5nID0gZG9tICE9IG51bGwgJiYgISgnX19wcmVhY3RhdHRyXycgaW4gZG9tKTtcblx0fVxuXG5cdHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG5cblx0aWYgKHBhcmVudCAmJiByZXQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQocmV0KTtcblxuXHRpZiAoISAtLWRpZmZMZXZlbCkge1xuXHRcdGh5ZHJhdGluZyA9IGZhbHNlO1xuXG5cdFx0aWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuXHR9XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpIHtcblx0dmFyIG91dCA9IGRvbSxcblx0ICAgIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuXG5cdGlmICh2bm9kZSA9PSBudWxsIHx8IHR5cGVvZiB2bm9kZSA9PT0gJ2Jvb2xlYW4nKSB2bm9kZSA9ICcnO1xuXG5cdGlmICh0eXBlb2Ygdm5vZGUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2bm9kZSA9PT0gJ251bWJlcicpIHtcblx0XHRpZiAoZG9tICYmIGRvbS5zcGxpdFRleHQgIT09IHVuZGVmaW5lZCAmJiBkb20ucGFyZW50Tm9kZSAmJiAoIWRvbS5fY29tcG9uZW50IHx8IGNvbXBvbmVudFJvb3QpKSB7XG5cdFx0XHRpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkge1xuXHRcdFx0XHRkb20ubm9kZVZhbHVlID0gdm5vZGU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcblx0XHRcdGlmIChkb20pIHtcblx0XHRcdFx0aWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuXHRcdFx0XHRyZWNvbGxlY3ROb2RlVHJlZShkb20sIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG91dFsnX19wcmVhY3RhdHRyXyddID0gdHJ1ZTtcblxuXHRcdHJldHVybiBvdXQ7XG5cdH1cblxuXHR2YXIgdm5vZGVOYW1lID0gdm5vZGUubm9kZU5hbWU7XG5cdGlmICh0eXBlb2Ygdm5vZGVOYW1lID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcblx0fVxuXG5cdGlzU3ZnTW9kZSA9IHZub2RlTmFtZSA9PT0gJ3N2ZycgPyB0cnVlIDogdm5vZGVOYW1lID09PSAnZm9yZWlnbk9iamVjdCcgPyBmYWxzZSA6IGlzU3ZnTW9kZTtcblxuXHR2bm9kZU5hbWUgPSBTdHJpbmcodm5vZGVOYW1lKTtcblx0aWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgdm5vZGVOYW1lKSkge1xuXHRcdG91dCA9IGNyZWF0ZU5vZGUodm5vZGVOYW1lLCBpc1N2Z01vZGUpO1xuXG5cdFx0aWYgKGRvbSkge1xuXHRcdFx0d2hpbGUgKGRvbS5maXJzdENoaWxkKSB7XG5cdFx0XHRcdG91dC5hcHBlbmRDaGlsZChkb20uZmlyc3RDaGlsZCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG5cblx0XHRcdHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIGZjID0gb3V0LmZpcnN0Q2hpbGQsXG5cdCAgICBwcm9wcyA9IG91dFsnX19wcmVhY3RhdHRyXyddLFxuXHQgICAgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG5cblx0aWYgKHByb3BzID09IG51bGwpIHtcblx0XHRwcm9wcyA9IG91dFsnX19wcmVhY3RhdHRyXyddID0ge307XG5cdFx0Zm9yICh2YXIgYSA9IG91dC5hdHRyaWJ1dGVzLCBpID0gYS5sZW5ndGg7IGktLTspIHtcblx0XHRcdHByb3BzW2FbaV0ubmFtZV0gPSBhW2ldLnZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHR5cGVvZiB2Y2hpbGRyZW5bMF0gPT09ICdzdHJpbmcnICYmIGZjICE9IG51bGwgJiYgZmMuc3BsaXRUZXh0ICE9PSB1bmRlZmluZWQgJiYgZmMubmV4dFNpYmxpbmcgPT0gbnVsbCkge1xuXHRcdGlmIChmYy5ub2RlVmFsdWUgIT0gdmNoaWxkcmVuWzBdKSB7XG5cdFx0XHRmYy5ub2RlVmFsdWUgPSB2Y2hpbGRyZW5bMF07XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IGZjICE9IG51bGwpIHtcblx0XHRcdGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwgIT0gbnVsbCk7XG5cdFx0fVxuXG5cdGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuXG5cdGlzU3ZnTW9kZSA9IHByZXZTdmdNb2RlO1xuXG5cdHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIGlubmVyRGlmZk5vZGUoZG9tLCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBpc0h5ZHJhdGluZykge1xuXHR2YXIgb3JpZ2luYWxDaGlsZHJlbiA9IGRvbS5jaGlsZE5vZGVzLFxuXHQgICAgY2hpbGRyZW4gPSBbXSxcblx0ICAgIGtleWVkID0ge30sXG5cdCAgICBrZXllZExlbiA9IDAsXG5cdCAgICBtaW4gPSAwLFxuXHQgICAgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsXG5cdCAgICBjaGlsZHJlbkxlbiA9IDAsXG5cdCAgICB2bGVuID0gdmNoaWxkcmVuID8gdmNoaWxkcmVuLmxlbmd0aCA6IDAsXG5cdCAgICBqLFxuXHQgICAgYyxcblx0ICAgIGYsXG5cdCAgICB2Y2hpbGQsXG5cdCAgICBjaGlsZDtcblxuXHRpZiAobGVuICE9PSAwKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dmFyIF9jaGlsZCA9IG9yaWdpbmFsQ2hpbGRyZW5baV0sXG5cdFx0XHQgICAgcHJvcHMgPSBfY2hpbGRbJ19fcHJlYWN0YXR0cl8nXSxcblx0XHRcdCAgICBrZXkgPSB2bGVuICYmIHByb3BzID8gX2NoaWxkLl9jb21wb25lbnQgPyBfY2hpbGQuX2NvbXBvbmVudC5fX2tleSA6IHByb3BzLmtleSA6IG51bGw7XG5cdFx0XHRpZiAoa2V5ICE9IG51bGwpIHtcblx0XHRcdFx0a2V5ZWRMZW4rKztcblx0XHRcdFx0a2V5ZWRba2V5XSA9IF9jaGlsZDtcblx0XHRcdH0gZWxzZSBpZiAocHJvcHMgfHwgKF9jaGlsZC5zcGxpdFRleHQgIT09IHVuZGVmaW5lZCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiB0cnVlIDogaXNIeWRyYXRpbmcpKSB7XG5cdFx0XHRcdGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0gX2NoaWxkO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmICh2bGVuICE9PSAwKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2bGVuOyBpKyspIHtcblx0XHRcdHZjaGlsZCA9IHZjaGlsZHJlbltpXTtcblx0XHRcdGNoaWxkID0gbnVsbDtcblxuXHRcdFx0dmFyIGtleSA9IHZjaGlsZC5rZXk7XG5cdFx0XHRpZiAoa2V5ICE9IG51bGwpIHtcblx0XHRcdFx0aWYgKGtleWVkTGVuICYmIGtleWVkW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNoaWxkID0ga2V5ZWRba2V5XTtcblx0XHRcdFx0XHRrZXllZFtrZXldID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGtleWVkTGVuLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAobWluIDwgY2hpbGRyZW5MZW4pIHtcblx0XHRcdFx0XHRmb3IgKGogPSBtaW47IGogPCBjaGlsZHJlbkxlbjsgaisrKSB7XG5cdFx0XHRcdFx0XHRpZiAoY2hpbGRyZW5bal0gIT09IHVuZGVmaW5lZCAmJiBpc1NhbWVOb2RlVHlwZShjID0gY2hpbGRyZW5bal0sIHZjaGlsZCwgaXNIeWRyYXRpbmcpKSB7XG5cdFx0XHRcdFx0XHRcdGNoaWxkID0gYztcblx0XHRcdFx0XHRcdFx0Y2hpbGRyZW5bal0gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG5cdFx0XHRcdFx0XHRcdGlmIChqID09PSBtaW4pIG1pbisrO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0Y2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG5cblx0XHRcdGYgPSBvcmlnaW5hbENoaWxkcmVuW2ldO1xuXHRcdFx0aWYgKGNoaWxkICYmIGNoaWxkICE9PSBkb20gJiYgY2hpbGQgIT09IGYpIHtcblx0XHRcdFx0aWYgKGYgPT0gbnVsbCkge1xuXHRcdFx0XHRcdGRvbS5hcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY2hpbGQgPT09IGYubmV4dFNpYmxpbmcpIHtcblx0XHRcdFx0XHRyZW1vdmVOb2RlKGYpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIGYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKGtleWVkTGVuKSB7XG5cdFx0Zm9yICh2YXIgaSBpbiBrZXllZCkge1xuXHRcdFx0aWYgKGtleWVkW2ldICE9PSB1bmRlZmluZWQpIHJlY29sbGVjdE5vZGVUcmVlKGtleWVkW2ldLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0d2hpbGUgKG1pbiA8PSBjaGlsZHJlbkxlbikge1xuXHRcdGlmICgoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkgIT09IHVuZGVmaW5lZCkgcmVjb2xsZWN0Tm9kZVRyZWUoY2hpbGQsIGZhbHNlKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZWNvbGxlY3ROb2RlVHJlZShub2RlLCB1bm1vdW50T25seSkge1xuXHR2YXIgY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50O1xuXHRpZiAoY29tcG9uZW50KSB7XG5cdFx0dW5tb3VudENvbXBvbmVudChjb21wb25lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChub2RlWydfX3ByZWFjdGF0dHJfJ10gIT0gbnVsbCAmJiBub2RlWydfX3ByZWFjdGF0dHJfJ10ucmVmKSBub2RlWydfX3ByZWFjdGF0dHJfJ10ucmVmKG51bGwpO1xuXG5cdFx0aWYgKHVubW91bnRPbmx5ID09PSBmYWxzZSB8fCBub2RlWydfX3ByZWFjdGF0dHJfJ10gPT0gbnVsbCkge1xuXHRcdFx0cmVtb3ZlTm9kZShub2RlKTtcblx0XHR9XG5cblx0XHRyZW1vdmVDaGlsZHJlbihub2RlKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG5cdG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcblx0d2hpbGUgKG5vZGUpIHtcblx0XHR2YXIgbmV4dCA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuXHRcdHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHRydWUpO1xuXHRcdG5vZGUgPSBuZXh0O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuXHR2YXIgbmFtZTtcblxuXHRmb3IgKG5hbWUgaW4gb2xkKSB7XG5cdFx0aWYgKCEoYXR0cnMgJiYgYXR0cnNbbmFtZV0gIT0gbnVsbCkgJiYgb2xkW25hbWVdICE9IG51bGwpIHtcblx0XHRcdHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB1bmRlZmluZWQsIGlzU3ZnTW9kZSk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yIChuYW1lIGluIGF0dHJzKSB7XG5cdFx0aWYgKG5hbWUgIT09ICdjaGlsZHJlbicgJiYgbmFtZSAhPT0gJ2lubmVySFRNTCcgJiYgKCEobmFtZSBpbiBvbGQpIHx8IGF0dHJzW25hbWVdICE9PSAobmFtZSA9PT0gJ3ZhbHVlJyB8fCBuYW1lID09PSAnY2hlY2tlZCcgPyBkb21bbmFtZV0gOiBvbGRbbmFtZV0pKSkge1xuXHRcdFx0c2V0QWNjZXNzb3IoZG9tLCBuYW1lLCBvbGRbbmFtZV0sIG9sZFtuYW1lXSA9IGF0dHJzW25hbWVdLCBpc1N2Z01vZGUpO1xuXHRcdH1cblx0fVxufVxuXG52YXIgcmVjeWNsZXJDb21wb25lbnRzID0gW107XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuXHR2YXIgaW5zdCxcblx0ICAgIGkgPSByZWN5Y2xlckNvbXBvbmVudHMubGVuZ3RoO1xuXG5cdGlmIChDdG9yLnByb3RvdHlwZSAmJiBDdG9yLnByb3RvdHlwZS5yZW5kZXIpIHtcblx0XHRpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpO1xuXHRcdENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcblx0fSBlbHNlIHtcblx0XHRpbnN0ID0gbmV3IENvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG5cdFx0aW5zdC5jb25zdHJ1Y3RvciA9IEN0b3I7XG5cdFx0aW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcblx0fVxuXG5cdHdoaWxlIChpLS0pIHtcblx0XHRpZiAocmVjeWNsZXJDb21wb25lbnRzW2ldLmNvbnN0cnVjdG9yID09PSBDdG9yKSB7XG5cdFx0XHRpbnN0Lm5leHRCYXNlID0gcmVjeWNsZXJDb21wb25lbnRzW2ldLm5leHRCYXNlO1xuXHRcdFx0cmVjeWNsZXJDb21wb25lbnRzLnNwbGljZShpLCAxKTtcblx0XHRcdHJldHVybiBpbnN0O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpbnN0O1xufVxuXG5mdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcblx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCByZW5kZXJNb2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuXHRpZiAoY29tcG9uZW50Ll9kaXNhYmxlKSByZXR1cm47XG5cdGNvbXBvbmVudC5fZGlzYWJsZSA9IHRydWU7XG5cblx0Y29tcG9uZW50Ll9fcmVmID0gcHJvcHMucmVmO1xuXHRjb21wb25lbnQuX19rZXkgPSBwcm9wcy5rZXk7XG5cdGRlbGV0ZSBwcm9wcy5yZWY7XG5cdGRlbGV0ZSBwcm9wcy5rZXk7XG5cblx0aWYgKHR5cGVvZiBjb21wb25lbnQuY29uc3RydWN0b3IuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzID09PSAndW5kZWZpbmVkJykge1xuXHRcdGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcblx0XHRcdGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KCk7XG5cdFx0fSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykge1xuXHRcdFx0Y29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG5cdFx0aWYgKCFjb21wb25lbnQucHJldkNvbnRleHQpIGNvbXBvbmVudC5wcmV2Q29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0O1xuXHRcdGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcblx0fVxuXG5cdGlmICghY29tcG9uZW50LnByZXZQcm9wcykgY29tcG9uZW50LnByZXZQcm9wcyA9IGNvbXBvbmVudC5wcm9wcztcblx0Y29tcG9uZW50LnByb3BzID0gcHJvcHM7XG5cblx0Y29tcG9uZW50Ll9kaXNhYmxlID0gZmFsc2U7XG5cblx0aWYgKHJlbmRlck1vZGUgIT09IDApIHtcblx0XHRpZiAocmVuZGVyTW9kZSA9PT0gMSB8fCBvcHRpb25zLnN5bmNDb21wb25lbnRVcGRhdGVzICE9PSBmYWxzZSB8fCAhY29tcG9uZW50LmJhc2UpIHtcblx0XHRcdHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChjb21wb25lbnQuX19yZWYpIGNvbXBvbmVudC5fX3JlZihjb21wb25lbnQpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCByZW5kZXJNb2RlLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuXHRpZiAoY29tcG9uZW50Ll9kaXNhYmxlKSByZXR1cm47XG5cblx0dmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzLFxuXHQgICAgc3RhdGUgPSBjb21wb25lbnQuc3RhdGUsXG5cdCAgICBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsXG5cdCAgICBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50LnByZXZQcm9wcyB8fCBwcm9wcyxcblx0ICAgIHByZXZpb3VzU3RhdGUgPSBjb21wb25lbnQucHJldlN0YXRlIHx8IHN0YXRlLFxuXHQgICAgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50LnByZXZDb250ZXh0IHx8IGNvbnRleHQsXG5cdCAgICBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLFxuXHQgICAgbmV4dEJhc2UgPSBjb21wb25lbnQubmV4dEJhc2UsXG5cdCAgICBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLFxuXHQgICAgaW5pdGlhbENoaWxkQ29tcG9uZW50ID0gY29tcG9uZW50Ll9jb21wb25lbnQsXG5cdCAgICBza2lwID0gZmFsc2UsXG5cdCAgICBzbmFwc2hvdCA9IHByZXZpb3VzQ29udGV4dCxcblx0ICAgIHJlbmRlcmVkLFxuXHQgICAgaW5zdCxcblx0ICAgIGNiYXNlO1xuXG5cdGlmIChjb21wb25lbnQuY29uc3RydWN0b3IuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKSB7XG5cdFx0c3RhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCBzdGF0ZSksIGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMocHJvcHMsIHN0YXRlKSk7XG5cdFx0Y29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG5cdH1cblxuXHRpZiAoaXNVcGRhdGUpIHtcblx0XHRjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuXHRcdGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG5cdFx0Y29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG5cdFx0aWYgKHJlbmRlck1vZGUgIT09IDIgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCkgPT09IGZhbHNlKSB7XG5cdFx0XHRza2lwID0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSB7XG5cdFx0XHRjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuXHRcdH1cblx0XHRjb21wb25lbnQucHJvcHMgPSBwcm9wcztcblx0XHRjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcblx0XHRjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG5cdH1cblxuXHRjb21wb25lbnQucHJldlByb3BzID0gY29tcG9uZW50LnByZXZTdGF0ZSA9IGNvbXBvbmVudC5wcmV2Q29udGV4dCA9IGNvbXBvbmVudC5uZXh0QmFzZSA9IG51bGw7XG5cdGNvbXBvbmVudC5fZGlydHkgPSBmYWxzZTtcblxuXHRpZiAoIXNraXApIHtcblx0XHRyZW5kZXJlZCA9IGNvbXBvbmVudC5yZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcblxuXHRcdGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSB7XG5cdFx0XHRjb250ZXh0ID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29udGV4dCksIGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSk7XG5cdFx0fVxuXG5cdFx0aWYgKGlzVXBkYXRlICYmIGNvbXBvbmVudC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZSkge1xuXHRcdFx0c25hcHNob3QgPSBjb21wb25lbnQuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dmFyIGNoaWxkQ29tcG9uZW50ID0gcmVuZGVyZWQgJiYgcmVuZGVyZWQubm9kZU5hbWUsXG5cdFx0ICAgIHRvVW5tb3VudCxcblx0XHQgICAgYmFzZTtcblxuXHRcdGlmICh0eXBlb2YgY2hpbGRDb21wb25lbnQgPT09ICdmdW5jdGlvbicpIHtcblxuXHRcdFx0dmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuXHRcdFx0aW5zdCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcblxuXHRcdFx0aWYgKGluc3QgJiYgaW5zdC5jb25zdHJ1Y3RvciA9PT0gY2hpbGRDb21wb25lbnQgJiYgY2hpbGRQcm9wcy5rZXkgPT0gaW5zdC5fX2tleSkge1xuXHRcdFx0XHRzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0b1VubW91bnQgPSBpbnN0O1xuXG5cdFx0XHRcdGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG5cdFx0XHRcdGluc3QubmV4dEJhc2UgPSBpbnN0Lm5leHRCYXNlIHx8IG5leHRCYXNlO1xuXHRcdFx0XHRpbnN0Ll9wYXJlbnRDb21wb25lbnQgPSBjb21wb25lbnQ7XG5cdFx0XHRcdHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDAsIGNvbnRleHQsIGZhbHNlKTtcblx0XHRcdFx0cmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCB0cnVlKTtcblx0XHRcdH1cblxuXHRcdFx0YmFzZSA9IGluc3QuYmFzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y2Jhc2UgPSBpbml0aWFsQmFzZTtcblxuXHRcdFx0dG9Vbm1vdW50ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuXHRcdFx0aWYgKHRvVW5tb3VudCkge1xuXHRcdFx0XHRjYmFzZSA9IGNvbXBvbmVudC5fY29tcG9uZW50ID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGluaXRpYWxCYXNlIHx8IHJlbmRlck1vZGUgPT09IDEpIHtcblx0XHRcdFx0aWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcblx0XHRcdFx0YmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChpbml0aWFsQmFzZSAmJiBiYXNlICE9PSBpbml0aWFsQmFzZSAmJiBpbnN0ICE9PSBpbml0aWFsQ2hpbGRDb21wb25lbnQpIHtcblx0XHRcdHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcblx0XHRcdGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcblx0XHRcdFx0YmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuXG5cdFx0XHRcdGlmICghdG9Vbm1vdW50KSB7XG5cdFx0XHRcdFx0aW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG5cdFx0XHRcdFx0cmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0b1VubW91bnQpIHtcblx0XHRcdHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcblx0XHR9XG5cblx0XHRjb21wb25lbnQuYmFzZSA9IGJhc2U7XG5cdFx0aWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcblx0XHRcdHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsXG5cdFx0XHQgICAgdCA9IGNvbXBvbmVudDtcblx0XHRcdHdoaWxlICh0ID0gdC5fcGFyZW50Q29tcG9uZW50KSB7XG5cdFx0XHRcdChjb21wb25lbnRSZWYgPSB0KS5iYXNlID0gYmFzZTtcblx0XHRcdH1cblx0XHRcdGJhc2UuX2NvbXBvbmVudCA9IGNvbXBvbmVudFJlZjtcblx0XHRcdGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuXHRcdH1cblx0fVxuXG5cdGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIHtcblx0XHRtb3VudHMudW5zaGlmdChjb21wb25lbnQpO1xuXHR9IGVsc2UgaWYgKCFza2lwKSB7XG5cblx0XHRpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZSkge1xuXHRcdFx0Y29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBzbmFwc2hvdCk7XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLmFmdGVyVXBkYXRlKSBvcHRpb25zLmFmdGVyVXBkYXRlKGNvbXBvbmVudCk7XG5cdH1cblxuXHR3aGlsZSAoY29tcG9uZW50Ll9yZW5kZXJDYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0Y29tcG9uZW50Ll9yZW5kZXJDYWxsYmFja3MucG9wKCkuY2FsbChjb21wb25lbnQpO1xuXHR9aWYgKCFkaWZmTGV2ZWwgJiYgIWlzQ2hpbGQpIGZsdXNoTW91bnRzKCk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG5cdHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50LFxuXHQgICAgb3JpZ2luYWxDb21wb25lbnQgPSBjLFxuXHQgICAgb2xkRG9tID0gZG9tLFxuXHQgICAgaXNEaXJlY3RPd25lciA9IGMgJiYgZG9tLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsXG5cdCAgICBpc093bmVyID0gaXNEaXJlY3RPd25lcixcblx0ICAgIHByb3BzID0gZ2V0Tm9kZVByb3BzKHZub2RlKTtcblx0d2hpbGUgKGMgJiYgIWlzT3duZXIgJiYgKGMgPSBjLl9wYXJlbnRDb21wb25lbnQpKSB7XG5cdFx0aXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuXHR9XG5cblx0aWYgKGMgJiYgaXNPd25lciAmJiAoIW1vdW50QWxsIHx8IGMuX2NvbXBvbmVudCkpIHtcblx0XHRzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMywgY29udGV4dCwgbW91bnRBbGwpO1xuXHRcdGRvbSA9IGMuYmFzZTtcblx0fSBlbHNlIHtcblx0XHRpZiAob3JpZ2luYWxDb21wb25lbnQgJiYgIWlzRGlyZWN0T3duZXIpIHtcblx0XHRcdHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuXHRcdFx0ZG9tID0gb2xkRG9tID0gbnVsbDtcblx0XHR9XG5cblx0XHRjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG5cdFx0aWYgKGRvbSAmJiAhYy5uZXh0QmFzZSkge1xuXHRcdFx0Yy5uZXh0QmFzZSA9IGRvbTtcblxuXHRcdFx0b2xkRG9tID0gbnVsbDtcblx0XHR9XG5cdFx0c2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDEsIGNvbnRleHQsIG1vdW50QWxsKTtcblx0XHRkb20gPSBjLmJhc2U7XG5cblx0XHRpZiAob2xkRG9tICYmIGRvbSAhPT0gb2xkRG9tKSB7XG5cdFx0XHRvbGREb20uX2NvbXBvbmVudCA9IG51bGw7XG5cdFx0XHRyZWNvbGxlY3ROb2RlVHJlZShvbGREb20sIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZG9tO1xufVxuXG5mdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuXHRpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcblxuXHR2YXIgYmFzZSA9IGNvbXBvbmVudC5iYXNlO1xuXG5cdGNvbXBvbmVudC5fZGlzYWJsZSA9IHRydWU7XG5cblx0aWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG5cblx0Y29tcG9uZW50LmJhc2UgPSBudWxsO1xuXG5cdHZhciBpbm5lciA9IGNvbXBvbmVudC5fY29tcG9uZW50O1xuXHRpZiAoaW5uZXIpIHtcblx0XHR1bm1vdW50Q29tcG9uZW50KGlubmVyKTtcblx0fSBlbHNlIGlmIChiYXNlKSB7XG5cdFx0aWYgKGJhc2VbJ19fcHJlYWN0YXR0cl8nXSAmJiBiYXNlWydfX3ByZWFjdGF0dHJfJ10ucmVmKSBiYXNlWydfX3ByZWFjdGF0dHJfJ10ucmVmKG51bGwpO1xuXG5cdFx0Y29tcG9uZW50Lm5leHRCYXNlID0gYmFzZTtcblxuXHRcdHJlbW92ZU5vZGUoYmFzZSk7XG5cdFx0cmVjeWNsZXJDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuXHRcdHJlbW92ZUNoaWxkcmVuKGJhc2UpO1xuXHR9XG5cblx0aWYgKGNvbXBvbmVudC5fX3JlZikgY29tcG9uZW50Ll9fcmVmKG51bGwpO1xufVxuXG5mdW5jdGlvbiBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpIHtcblx0dGhpcy5fZGlydHkgPSB0cnVlO1xuXG5cdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG5cblx0dGhpcy5wcm9wcyA9IHByb3BzO1xuXG5cdHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuXG5cdHRoaXMuX3JlbmRlckNhbGxiYWNrcyA9IFtdO1xufVxuXG5leHRlbmQoQ29tcG9uZW50LnByb3RvdHlwZSwge1xuXHRzZXRTdGF0ZTogZnVuY3Rpb24gc2V0U3RhdGUoc3RhdGUsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCF0aGlzLnByZXZTdGF0ZSkgdGhpcy5wcmV2U3RhdGUgPSB0aGlzLnN0YXRlO1xuXHRcdHRoaXMuc3RhdGUgPSBleHRlbmQoZXh0ZW5kKHt9LCB0aGlzLnN0YXRlKSwgdHlwZW9mIHN0YXRlID09PSAnZnVuY3Rpb24nID8gc3RhdGUodGhpcy5zdGF0ZSwgdGhpcy5wcm9wcykgOiBzdGF0ZSk7XG5cdFx0aWYgKGNhbGxiYWNrKSB0aGlzLl9yZW5kZXJDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0ZW5xdWV1ZVJlbmRlcih0aGlzKTtcblx0fSxcblx0Zm9yY2VVcGRhdGU6IGZ1bmN0aW9uIGZvcmNlVXBkYXRlKGNhbGxiYWNrKSB7XG5cdFx0aWYgKGNhbGxiYWNrKSB0aGlzLl9yZW5kZXJDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0cmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHt9XG59KTtcblxuZnVuY3Rpb24gcmVuZGVyKHZub2RlLCBwYXJlbnQsIG1lcmdlKSB7XG4gIHJldHVybiBkaWZmKG1lcmdlLCB2bm9kZSwge30sIGZhbHNlLCBwYXJlbnQsIGZhbHNlKTtcbn1cblxudmFyIHByZWFjdCA9IHtcblx0aDogaCxcblx0Y3JlYXRlRWxlbWVudDogaCxcblx0Y2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG5cdENvbXBvbmVudDogQ29tcG9uZW50LFxuXHRyZW5kZXI6IHJlbmRlcixcblx0cmVyZW5kZXI6IHJlcmVuZGVyLFxuXHRvcHRpb25zOiBvcHRpb25zXG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcmVhY3Q7XG5leHBvcnQgeyBoLCBoIGFzIGNyZWF0ZUVsZW1lbnQsIGNsb25lRWxlbWVudCwgQ29tcG9uZW50LCByZW5kZXIsIHJlcmVuZGVyLCBvcHRpb25zIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QubWpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxuXHJcblxyXG52YXIgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSQxKHN0YXRlLCBtaWRkbGV3YXJlKSB7XHJcbiAgICBpZiAoc3RhdGUgPT09IHZvaWQgMCkgeyBzdGF0ZSA9IHt9OyB9XHJcbiAgICBpZiAobWlkZGxld2FyZSA9PT0gdm9pZCAwKSB7IG1pZGRsZXdhcmUgPSBudWxsOyB9XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gW107XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1pZGRsZXdhcmU6IG1pZGRsZXdhcmUsXHJcbiAgICAgICAgc2V0U3RhdGU6IGZ1bmN0aW9uICh1cGRhdGUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPVxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgPyBfX2Fzc2lnbih7fSwgc3RhdGUsIHVwZGF0ZShzdGF0ZSkpIDogX19hc3NpZ24oe30sIHN0YXRlLCB1cGRhdGUpO1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoZikgeyByZXR1cm4gZihzdGF0ZSk7IH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaChmKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UobGlzdGVuZXJzLmluZGV4T2YoZiksIDEpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlU3RvcmUkMTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxudmFyIHByZWFjdCA9IHJlcXVpcmUoJ3ByZWFjdCcpO1xuXG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG5cclxuZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxudmFyIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufTtcblxuZnVuY3Rpb24gc2hhbGxvd0VxdWFsKGEsIGIpIHtcclxuICAgIGZvciAodmFyIGkgaW4gYSlcclxuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSBpbiBiKVxyXG4gICAgICAgIGlmICghKGkgaW4gYSkpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59XG5cbmZ1bmN0aW9uIHNldChzdG9yZSwgcmV0KSB7XHJcbiAgICBpZiAocmV0ICE9IG51bGwpIHtcclxuICAgICAgICBpZiAocmV0LnRoZW4pXHJcbiAgICAgICAgICAgIHJldHVybiByZXQudGhlbihzdG9yZS5zZXRTdGF0ZSk7XHJcbiAgICAgICAgc3RvcmUuc2V0U3RhdGUocmV0KTtcclxuICAgIH1cclxufVxuXG5mdW5jdGlvbiBiaW5kQWN0aW9ucyhhY3Rpb25zLCBzdG9yZSwgb3duUHJvcHMpIHtcclxuICAgIGFjdGlvbnMgPSB0eXBlb2YgYWN0aW9ucyA9PT0gXCJmdW5jdGlvblwiID8gYWN0aW9ucyhzdG9yZSwgb3duUHJvcHMpIDogYWN0aW9ucztcclxuICAgIHZhciBib3VuZCA9IHt9O1xyXG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAobmFtZV8xKSB7XHJcbiAgICAgICAgYm91bmRbbmFtZV8xXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gYWN0aW9uc1tuYW1lXzFdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0b3JlLm1pZGRsZXdhcmUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLm1pZGRsZXdhcmUoc3RvcmUsIGFjdGlvbiwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldChzdG9yZSwgYWN0aW9uLmFwcGx5KHZvaWQgMCwgW3N0b3JlLmdldFN0YXRlKCldLmNvbmNhdChhcmdzKSkpO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgZm9yICh2YXIgbmFtZV8xIGluIGFjdGlvbnMpIHtcclxuICAgICAgICBfbG9vcF8xKG5hbWVfMSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYm91bmQ7XHJcbn1cblxudmFyIENvbm5lY3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoQ29ubmVjdCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIENvbm5lY3QoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuc3RhdGUgPSBfdGhpcy5nZXRQcm9wcygpO1xyXG4gICAgICAgIF90aGlzLmFjdGlvbnMgPSBfdGhpcy5nZXRBY3Rpb25zKCk7XHJcbiAgICAgICAgX3RoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgbWFwcGVkID0gX3RoaXMuZ2V0UHJvcHMoKTtcclxuICAgICAgICAgICAgaWYgKCFzaGFsbG93RXF1YWwobWFwcGVkLCBfdGhpcy5zdGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKG1hcHBlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIENvbm5lY3QucHJvdG90eXBlLmNvbXBvbmVudFdpbGxNb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnVuc3Vic2NyaWJlID0gdGhpcy5jb250ZXh0LnN0b3JlLnN1YnNjcmliZSh0aGlzLnVwZGF0ZSk7XHJcbiAgICB9O1xyXG4gICAgQ29ubmVjdC5wcm90b3R5cGUuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy51bnN1YnNjcmliZSh0aGlzLnVwZGF0ZSk7XHJcbiAgICB9O1xyXG4gICAgQ29ubmVjdC5wcm90b3R5cGUuZ2V0UHJvcHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1hcFRvUHJvcHMgPSB0aGlzLnByb3BzLm1hcFRvUHJvcHM7XHJcbiAgICAgICAgdmFyIHN0YXRlID0gKHRoaXMuY29udGV4dC5zdG9yZSAmJiB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0U3RhdGUoKSkgfHwge307XHJcbiAgICAgICAgcmV0dXJuIG1hcFRvUHJvcHMgPyBtYXBUb1Byb3BzKHN0YXRlLCB0aGlzLnByb3BzKSA6IHN0YXRlO1xyXG4gICAgfTtcclxuICAgIENvbm5lY3QucHJvdG90eXBlLmdldEFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGFjdGlvbnMgPSB0aGlzLnByb3BzLmFjdGlvbnM7XHJcbiAgICAgICAgcmV0dXJuIGJpbmRBY3Rpb25zKGFjdGlvbnMsIHRoaXMuY29udGV4dC5zdG9yZSwgdGhpcy5wcm9wcyk7XHJcbiAgICB9O1xyXG4gICAgQ29ubmVjdC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKF9hLCBzdGF0ZSwgX2IpIHtcclxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBfYS5jaGlsZHJlbjtcclxuICAgICAgICB2YXIgc3RvcmUgPSBfYi5zdG9yZTtcclxuICAgICAgICByZXR1cm4gY2hpbGRyZW5bMF0oX19hc3NpZ24oeyBzdG9yZTogc3RvcmUgfSwgc3RhdGUsIHRoaXMuYWN0aW9ucykpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDb25uZWN0O1xyXG59KHByZWFjdC5Db21wb25lbnQpKTtcclxuLy8gWyBIQUNLIF0gdG8gYXZvaWQgVHlwZWNoZWNrc1xyXG4vLyBzaW5jZSB0aGVyZSBpcyBhIHNtYWxsIGNvbmZsaWN0IGJldHdlZW4gcHJlYWN0IGFuZCByZWFjdCB0eXBpbmdzXHJcbi8vIGluIHRoZSBmdXR1cmUgdGhpcyBtaWdodCBiZWNvbWUgdW5lY2Vzc2FyeSBieSB1cGRhdGluZyB0eXBpbmdzXHJcbnZhciBDb25uZWN0VW50eXBlZCA9IENvbm5lY3Q7XHJcbmZ1bmN0aW9uIGNvbm5lY3QobWFwVG9Qcm9wcywgYWN0aW9ucykge1xyXG4gICAgaWYgKGFjdGlvbnMgPT09IHZvaWQgMCkgeyBhY3Rpb25zID0ge307IH1cclxuICAgIHJldHVybiBmdW5jdGlvbiAoQ2hpbGQpIHtcclxuICAgICAgICByZXR1cm4gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgICAgICAgICBfX2V4dGVuZHMoQ29ubmVjdFdyYXBwZXIsIF9zdXBlcik7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIENvbm5lY3RXcmFwcGVyKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIENvbm5lY3RXcmFwcGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLnByb3BzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChwcmVhY3QuaChDb25uZWN0VW50eXBlZCwgX19hc3NpZ24oe30sIHByb3BzLCB7IG1hcFRvUHJvcHM6IG1hcFRvUHJvcHMsIGFjdGlvbnM6IGFjdGlvbnMgfSksIGZ1bmN0aW9uIChtYXBwZWRQcm9wcykgeyByZXR1cm4gcHJlYWN0LmgoQ2hpbGQsIF9fYXNzaWduKHt9LCBtYXBwZWRQcm9wcywgcHJvcHMpKTsgfSkpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gQ29ubmVjdFdyYXBwZXI7XHJcbiAgICAgICAgfShwcmVhY3QuQ29tcG9uZW50KSk7XHJcbiAgICB9O1xyXG59XG5cbnZhciBQcm92aWRlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhQcm92aWRlciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFByb3ZpZGVyKCkge1xyXG4gICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcclxuICAgIH1cclxuICAgIFByb3ZpZGVyLnByb3RvdHlwZS5nZXRDaGlsZENvbnRleHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3RvcmU6IHRoaXMucHJvcHMuc3RvcmUgfTtcclxuICAgIH07XHJcbiAgICBQcm92aWRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuWzBdO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQcm92aWRlcjtcclxufShwcmVhY3QuQ29tcG9uZW50KSk7XG5cbmV4cG9ydHMuY29ubmVjdCA9IGNvbm5lY3Q7XG5leHBvcnRzLlByb3ZpZGVyID0gUHJvdmlkZXI7XG5leHBvcnRzLkNvbm5lY3QgPSBDb25uZWN0O1xuIiwiaW1wb3J0IHsgaCwgQ29tcG9uZW50IH0gZnJvbSAncHJlYWN0JztcbmltcG9ydCB7IGNvbm5lY3QgfSBmcm9tICdyZWR1eC16ZXJvL3ByZWFjdCc7XG5pbXBvcnQgbWVzc2FnZUJyb2tlciBmcm9tICcuL21lc3NhZ2luZyc7XG5pbXBvcnQgVG9vbGJhckNvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcnMvVG9vbGJhckNvbnRhaW5lcic7XG5pbXBvcnQgUHJldmlld0NvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcnMvUHJldmlld0NvbnRhaW5lcic7XG5pbXBvcnQgeyBhY3Rpb25zLCBJU291cmNlLCBJU3RhdGUgfSBmcm9tICcuL3N0b3JlJztcblxuaW50ZXJmYWNlIEFwcFByb3BzIHtcbiAgICB1cGRhdGVTb3VyY2U6IEZ1bmN0aW9uO1xuICAgIHVwZGF0ZVNldHRpbmdzOiBGdW5jdGlvbjtcbiAgICBzb3VyY2U6IElTb3VyY2U7XG59XG5cbmNvbnN0IG1hcFRvUHJvcHMgPSAoc3RhdGU6IElTdGF0ZSkgPT4gKHsgc291cmNlOiBzdGF0ZS5zb3VyY2UgfSk7XG5cbmNsYXNzIEFwcCBleHRlbmRzIENvbXBvbmVudDxBcHBQcm9wcz4ge1xuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBtZXNzYWdlQnJva2VyLmFkZExpc3RlbmVyKCdzb3VyY2U6dXBkYXRlJywgdGhpcy5wcm9wcy51cGRhdGVTb3VyY2UpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBtZXNzYWdlQnJva2VyLnJlbW92ZUxpc3RlbmVyKCdzb3VyY2U6dXBkYXRlJywgdGhpcy5wcm9wcy51cGRhdGVTb3VyY2UpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGF5b3V0XCI+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5zb3VyY2UuZGF0YSAmJiA8UHJldmlld0NvbnRhaW5lci8+fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb25uZWN0KG1hcFRvUHJvcHMsIGFjdGlvbnMpKEFwcCk7IiwiaW1wb3J0IHsgaCwgRnVuY3Rpb25hbENvbXBvbmVudCwgUmVmIH0gZnJvbSAncHJlYWN0JztcblxuaW1wb3J0IHsgSVNldHRpbmdzIH0gZnJvbSAnLi4vc3RvcmUvSVN0YXRlJztcblxuaW50ZXJmYWNlIFByZXZpZXdQcm9wcyB7XG4gICAgZGF0YTogc3RyaW5nO1xuICAgIHNldHRpbmdzOiBJU2V0dGluZ3M7XG4gICAgYXR0YWNoUmVmOiBSZWY8SFRNTEltYWdlRWxlbWVudD47XG4gICAgZGltZW5zaW9uOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB1bml0czogc3RyaW5nIH07XG4gICAgb25XaGVlbDogSlNYLldoZWVsRXZlbnRIYW5kbGVyO1xuICAgIGJhY2tncm91bmQ6IHN0cmluZztcbn1cblxuY29uc3QgUHJldmlldzogRnVuY3Rpb25hbENvbXBvbmVudDxQcmV2aWV3UHJvcHM+ID0gKHsgXG4gICAgZGF0YSwgXG4gICAgYXR0YWNoUmVmLFxuICAgIGRpbWVuc2lvbjogeyB3aWR0aCwgaGVpZ2h0LCB1bml0cyB9LCBcbiAgICBvbldoZWVsLFxuICAgIGJhY2tncm91bmQsXG4gICAgc2V0dGluZ3Ncbn0pID0+IHtcbiAgICBjb25zdCBzdHlsZXMgPSB7XG4gICAgICAgIHdpZHRoOiBgJHt3aWR0aH0ke3VuaXRzfWAsXG4gICAgICAgIG1pbldpZHRoOiBgJHt3aWR0aH0ke3VuaXRzfWAsXG4gICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fSR7dW5pdHN9YCxcbiAgICAgICAgbWluSGVpZ2h0OiBgJHtoZWlnaHR9JHt1bml0c31gXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHByZXZpZXcgJHtiYWNrZ3JvdW5kfSAke3NldHRpbmdzLnNob3dCb3VuZGluZ0JveD8gJ2JvdW5kaW5nLWJveCcgOiAnJ31gfSBvbldoZWVsPXtvbldoZWVsfT5cbiAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICBzcmM9e2BkYXRhOmltYWdlL3N2Zyt4bWwsJHtlbmNvZGVVUklDb21wb25lbnQoZGF0YSl9YH1cbiAgICAgICAgICAgICAgICByZWY9e2F0dGFjaFJlZn1cbiAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGVzfVxuICAgICAgICAgICAgICAgIGFsdD1cIlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUHJldmlldzsiLCJpbXBvcnQgeyBoLCBGdW5jdGlvbmFsQ29tcG9uZW50IH0gZnJvbSAncHJlYWN0JztcblxuY29uc3QgUHJldmlld0Vycm9yOiBGdW5jdGlvbmFsQ29tcG9uZW50ID0gKCkgPT4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3ItY29udGFpbmVyXCI+XG4gICAgICAgIDxpbWcgc3JjPVwidnNjb2RlLXJlc291cmNlOmVycm9yLnBuZ1wiIC8+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+SW1hZ2UgTm90IExvYWRlZDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+VHJ5IHRvIG9wZW4gaXQgZXh0ZXJuYWxseSB0byBmaXggZm9ybWF0IHByb2JsZW08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgUHJldmlld0Vycm9yOyIsImltcG9ydCB7IGgsIEZ1bmN0aW9uYWxDb21wb25lbnQgfSBmcm9tICdwcmVhY3QnO1xuXG5pbnRlcmZhY2UgVG9vbGJhclByb3BzIHtcbiAgICBvbkNoYW5nZUJhY2tncm91bmRCdXR0b25DbGljazogSlNYLk1vdXNlRXZlbnRIYW5kbGVyO1xuICAgIHpvb21JbjogRnVuY3Rpb247XG4gICAgem9vbU91dDogRnVuY3Rpb247XG4gICAgem9vbVJlc2V0OiBGdW5jdGlvbjtcbiAgICBmaWxlU2l6ZT86IHN0cmluZztcbiAgICBzb3VyY2VJbWFnZVZhbGlkaXR5OiBib29sZWFuO1xuICAgIG9uQnRuTW91c2VEb3duOiBKU1guTW91c2VFdmVudEhhbmRsZXI7XG4gICAgYWN0aXZlQnRuPzogc3RyaW5nO1xufVxuXG5jb25zdCBUb29sYmFyOiBGdW5jdGlvbmFsQ29tcG9uZW50PFRvb2xiYXJQcm9wcz4gPSAoe1xuICAgICBvbkNoYW5nZUJhY2tncm91bmRCdXR0b25DbGljaywgem9vbUluLCB6b29tT3V0LCB6b29tUmVzZXQsIGZpbGVTaXplLCBzb3VyY2VJbWFnZVZhbGlkaXR5LCBvbkJ0bk1vdXNlRG93biwgYWN0aXZlQnRuXG4gICAgfSkgPT4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgICBuYW1lPVwiem9vbS1pblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcmVzZXQtYnV0dG9uIGJ0biBidG4tcGx1cyAke2FjdGl2ZUJ0biA9PT0gJ3pvb20taW4nPyAnYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFzb3VyY2VJbWFnZVZhbGlkaXR5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3pvb21JbiBhcyBKU1guTW91c2VFdmVudEhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd249e29uQnRuTW91c2VEb3dufVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBuYW1lPVwiem9vbS1vdXRcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHJlc2V0LWJ1dHRvbiBidG4gYnRuLW1pbnVzICR7YWN0aXZlQnRuID09PSAnem9vbS1vdXQnPyAnYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFzb3VyY2VJbWFnZVZhbGlkaXR5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3pvb21PdXQgYXMgSlNYLk1vdXNlRXZlbnRIYW5kbGVyfVxuICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXtvbkJ0bk1vdXNlRG93bn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgbmFtZT1cInJlc2V0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2ByZXNldC1idXR0b24gYnRuIGJ0bi1vbmUtdG8tb25lICR7YWN0aXZlQnRuID09PSAncmVzZXQnPyAnYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFzb3VyY2VJbWFnZVZhbGlkaXR5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3pvb21SZXNldCBhcyBKU1guTW91c2VFdmVudEhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd249e29uQnRuTW91c2VEb3dufVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VwYXJhdG9yXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ncm91cFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BiZy1jb250YWluZXIgJHthY3RpdmVCdG4gPT09ICdkYXJrJyA/ICdzZWxlY3RlZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshc291cmNlSW1hZ2VWYWxpZGl0eX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVzZXQtYnV0dG9uIGJnIGRhcmtcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZGFya1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2hhbmdlQmFja2dyb3VuZEJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17b25CdG5Nb3VzZURvd259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BiZy1jb250YWluZXIgJHthY3RpdmVCdG4gPT09ICdsaWdodCcgPyAnc2VsZWN0ZWQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXNvdXJjZUltYWdlVmFsaWRpdHl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlc2V0LWJ1dHRvbiBiZyBsaWdodFwiXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJsaWdodFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2hhbmdlQmFja2dyb3VuZEJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17b25CdG5Nb3VzZURvd259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BiZy1jb250YWluZXIgJHthY3RpdmVCdG4gPT09ICd0cmFuc3BhcmVudCcgPyAnc2VsZWN0ZWQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXNvdXJjZUltYWdlVmFsaWRpdHl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlc2V0LWJ1dHRvbiBiZyB0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2hhbmdlQmFja2dyb3VuZEJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17b25CdG5Nb3VzZURvd259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaXplXCI+e2ZpbGVTaXplfTwvZGl2PlxuICAgIDwvZGl2PlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgVG9vbGJhcjsiLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tICdwcmVhY3QnO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlZHV4LXplcm8vcHJlYWN0JztcbmltcG9ydCB7IGFjdGlvbnMsIElTb3VyY2UsIElTdGF0ZSB9IGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCBQcmV2aWV3IGZyb20gJy4uL2NvbXBvbmVudHMvUHJldmlldyc7XG5pbXBvcnQgUHJldmlld0Vycm9yIGZyb20gJy4uL2NvbXBvbmVudHMvUHJldmlld0Vycm9yJztcbmltcG9ydCB0ZWxlbWV0cnlSZXBvcnRlciBmcm9tICcuLi9tZXNzYWdpbmcvdGVsZW1ldHJ5JztcblxudHlwZSBkaW1lbnNpb24gPSB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH07XG5cbnR5cGUgQ2hyb21lV2hlZWxFdmVudCA9IFdoZWVsRXZlbnQgJiB7IHdoZWVsRGVsdGE6IG51bWJlcjsgfTtcblxuaW50ZXJmYWNlIFByZXZpZXdDb250YWluZXJQcm9wcyB7XG4gICAgc291cmNlOiBJU291cmNlO1xuICAgIHNjYWxlOiBudW1iZXI7XG4gICAgYmFja2dyb3VuZDogc3RyaW5nO1xuICAgIHpvb21JbjogRnVuY3Rpb247XG4gICAgem9vbU91dDogRnVuY3Rpb247XG4gICAgdG9nZ2xlU291cmNlSW1hZ2VWYWxpZGl0eTogRnVuY3Rpb247XG59XG5cbmludGVyZmFjZSBQcmV2aWV3Q29udGFpbmVyU3RhdGUge1xuICAgIHNob3dQcmV2aWV3RXJyb3I6IGJvb2xlYW47XG59XG5cbmNvbnN0IE5FV19MSU5FX1JFR0VYUCA9IC9bXFxyXFxuXSsvZztcbmNvbnN0IFNWR19UQUdfUkVHRVhQID0gLzxzdmcuKz8+LztcbmNvbnN0IFdJRFRIX1JFR0VYUCA9IC93aWR0aD0oXCJ8JykoWzAtOS4sXSspXFx3KihcInwnKS87XG5jb25zdCBIRUlHSFRfUkVHRVhQID0gL2hlaWdodD0oXCJ8JykoWzAtOS4sXSspXFx3KihcInwnKS87XG5cbmNsYXNzIFByZXZpZXdDb250YWluZXIgZXh0ZW5kcyBDb21wb25lbnQ8UHJldmlld0NvbnRhaW5lclByb3BzLCBQcmV2aWV3Q29udGFpbmVyU3RhdGU+IHtcbiAgICBwcml2YXRlIGltYWdlRWw/OiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IFByZXZpZXdDb250YWluZXJQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgc2hvd1ByZXZpZXdFcnJvcjogZmFsc2UgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5pbWFnZUVsIS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMub25FcnJvcik7XG4gICAgICAgIHRoaXMuaW1hZ2VFbCEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMub25Mb2FkKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogUHJldmlld0NvbnRhaW5lclByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuc291cmNlLmRhdGEgIT09IHRoaXMucHJvcHMuc291cmNlLmRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UHJldmlld0Vycm9yOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF0dGFjaFJlZiA9IChlbDogSFRNTEltYWdlRWxlbWVudCkgPT4ge1xuICAgICAgICB0aGlzLmltYWdlRWwgPSBlbDtcbiAgICB9XG5cbiAgICBvbldoZWVsID0gKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkpIHsgcmV0dXJuOyB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxldCBkZWx0YSA9IE1hdGguc2lnbigoZXZlbnQgYXMgQ2hyb21lV2hlZWxFdmVudCkud2hlZWxEZWx0YSk7XG4gICAgICAgIGlmIChkZWx0YSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy56b29tSW4oKTtcbiAgICAgICAgICAgIHRlbGVtZXRyeVJlcG9ydGVyLnNlbmRab29tRXZlbnQoJ2luJywgJ21vdXNld2hlZWwnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsdGEgPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnpvb21PdXQoKTtcbiAgICAgICAgICAgIHRlbGVtZXRyeVJlcG9ydGVyLnNlbmRab29tRXZlbnQoJ291dCcsICdtb3VzZXdoZWVsJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkVycm9yID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1ByZXZpZXdFcnJvcjogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy50b2dnbGVTb3VyY2VJbWFnZVZhbGlkaXR5KGZhbHNlKTtcbiAgICB9XG5cbiAgICBvbkxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UHJldmlld0Vycm9yOiBmYWxzZSB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy50b2dnbGVTb3VyY2VJbWFnZVZhbGlkaXR5KHRydWUpO1xuICAgIH1cblxuICAgIGdldE9yaWdpbmFsRGltZW5zaW9uKGRhdGE6IHN0cmluZyk6IGRpbWVuc2lvbiB8IG51bGwge1xuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBkYXRhLnJlcGxhY2UoTkVXX0xJTkVfUkVHRVhQLCAnICcpO1xuICAgICAgICBjb25zdCBzdmcgPSBmb3JtYXR0ZWQubWF0Y2goU1ZHX1RBR19SRUdFWFApO1xuICAgICAgICBsZXQgd2lkdGggPSBudWxsLCBoZWlnaHQgPSBudWxsO1xuICAgICAgICBpZiAoc3ZnICYmIHN2Zy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHdpZHRoID0gc3ZnWzBdLm1hdGNoKFdJRFRIX1JFR0VYUCkgPyBzdmdbMF0ubWF0Y2goV0lEVEhfUkVHRVhQKSFbMl0gOiBudWxsO1xuICAgICAgICAgICAgaGVpZ2h0ID0gc3ZnWzBdLm1hdGNoKEhFSUdIVF9SRUdFWFApID8gc3ZnWzBdLm1hdGNoKEhFSUdIVF9SRUdFWFApIVsyXSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpZHRoICYmIGhlaWdodCA/IHsgd2lkdGg6IHBhcnNlRmxvYXQod2lkdGgpLCBoZWlnaHQ6IHBhcnNlRmxvYXQod2lkdGgpIH0gOiBudWxsO1xuICAgIH1cblxuICAgIGdldFNjYWxlZERpbWVuc2lvbigpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxEaW1lbnNpb24gPSB0aGlzLmdldE9yaWdpbmFsRGltZW5zaW9uKHRoaXMucHJvcHMuc291cmNlLmRhdGEpO1xuXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsV2lkdGggPSBvcmlnaW5hbERpbWVuc2lvbiA/IG9yaWdpbmFsRGltZW5zaW9uLndpZHRoIDogMTAwO1xuICAgICAgICBjb25zdCBvcmlnaW5hbEhlaWdodCA9IG9yaWdpbmFsRGltZW5zaW9uID8gb3JpZ2luYWxEaW1lbnNpb24uaGVpZ2h0IDogMTAwO1xuICAgICAgICBjb25zdCB1bml0cyA9IG9yaWdpbmFsRGltZW5zaW9uID8gJ3B4JyA6ICclJztcblxuICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgIHdpZHRoOiBwYXJzZUludCgob3JpZ2luYWxXaWR0aCAqIHRoaXMucHJvcHMuc2NhbGUpLnRvU3RyaW5nKCkpLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJzZUludCgob3JpZ2luYWxIZWlnaHQgKiB0aGlzLnByb3BzLnNjYWxlKS50b1N0cmluZygpKSxcbiAgICAgICAgICAgIHVuaXRzIFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2hvd1ByZXZpZXdFcnJvciA/XG4gICAgICAgICAgICA8UHJldmlld0Vycm9yIC8+IDpcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICA8UHJldmlld1xuICAgICAgICAgICAgICAgICAgICBkYXRhPXt0aGlzLnByb3BzLnNvdXJjZS5kYXRhfVxuICAgICAgICAgICAgICAgICAgICBhdHRhY2hSZWY9e3RoaXMuYXR0YWNoUmVmfVxuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb249e3RoaXMuZ2V0U2NhbGVkRGltZW5zaW9uKCl9XG4gICAgICAgICAgICAgICAgICAgIG9uV2hlZWw9e3RoaXMub25XaGVlbH1cbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZD17dGhpcy5wcm9wcy5iYWNrZ3JvdW5kfVxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncz17dGhpcy5wcm9wcy5zb3VyY2Uuc2V0dGluZ3N9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgfVxufVxuXG5jb25zdCBtYXBUb1Byb3BzID0gKHN0YXRlOiBJU3RhdGUpID0+ICh7IHNvdXJjZTogc3RhdGUuc291cmNlLCBzY2FsZTogc3RhdGUuc2NhbGUsIGJhY2tncm91bmQ6IHN0YXRlLmJhY2tncm91bmQgfSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbm5lY3QobWFwVG9Qcm9wcywgYWN0aW9ucykoUHJldmlld0NvbnRhaW5lcik7XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tICdwcmVhY3QnO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlZHV4LXplcm8vcHJlYWN0JztcbmltcG9ydCBUb29sYmFyIGZyb20gJy4uL2NvbXBvbmVudHMvVG9vbGJhcic7XG5pbXBvcnQgeyBhY3Rpb25zLCBJU3RhdGUsIElTb3VyY2UgfSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBnZXRCeXRlQ291bnRCeUNvbnRlbnQsIGh1bWFuRmlsZVNpemUgfSBmcm9tICcuLi91dGlscy9maWxlU2l6ZSc7XG5pbXBvcnQgdGVsZW1ldHJ5UmVwb3J0ZXIgZnJvbSAnLi4vbWVzc2FnaW5nL3RlbGVtZXRyeSc7XG5cbmNvbnN0IFNDQUxFX1NURVAgPSAwLjU7XG5cbmludGVyZmFjZSBUb29sYmFyQ29udGFpbmVyUHJvcHMge1xuICAgIGNoYW5nZUJhY2tncm91bmQ6IEZ1bmN0aW9uO1xuICAgIHpvb21JbjogRnVuY3Rpb247XG4gICAgem9vbU91dDogRnVuY3Rpb247XG4gICAgem9vbVJlc2V0OiBGdW5jdGlvbjtcbiAgICBzb3VyY2U6IElTb3VyY2U7XG4gICAgc291cmNlSW1hZ2VWYWxpZGl0eTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFRvb2xiYXJDb250YWluZXJTdGF0ZSB7XG4gICAgYWN0aXZlQnRuPzogc3RyaW5nO1xufVxuXG5jbGFzcyBUb29sYmFyQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50PFRvb2xiYXJDb250YWluZXJQcm9wcywgVG9vbGJhckNvbnRhaW5lclN0YXRlPiB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uQnRuTW91c2VVcCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHdpbmRvdy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbkJ0bk1vdXNlVXApO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlQmFja2dyb3VuZEJ1dHRvbkNsaWNrID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VCYWNrZ3JvdW5kKGUuc3JjRWxlbWVudCEuZ2V0QXR0cmlidXRlKCduYW1lJykpO1xuICAgIH1cblxuICAgIGdldEZpbGVTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5zb3VyY2UuZGF0YSA/ICBodW1hbkZpbGVTaXplKGdldEJ5dGVDb3VudEJ5Q29udGVudCh0aGlzLnByb3BzLnNvdXJjZS5kYXRhKSkgOiAnMCBCJztcbiAgICB9XG5cbiAgICBvbkJ0bk1vdXNlRG93biA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBhY3RpdmVCdG46IChlLmN1cnJlbnRUYXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQpIS5uYW1lIH0pO1xuICAgIH1cblxuICAgIG9uQnRuTW91c2VVcCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZUJ0bjogJycgfSk7XG4gICAgfVxuXG4gICAgem9vbUluID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnpvb21JbihTQ0FMRV9TVEVQKTtcbiAgICAgICAgdGVsZW1ldHJ5UmVwb3J0ZXIuc2VuZFpvb21FdmVudCgnaW4nLCAndG9vbGJhcicpO1xuICAgIH1cblxuICAgIHpvb21PdXQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuem9vbU91dChTQ0FMRV9TVEVQKTtcbiAgICAgICAgdGVsZW1ldHJ5UmVwb3J0ZXIuc2VuZFpvb21FdmVudCgnb3V0JywgJ3Rvb2xiYXInKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8VG9vbGJhciBcbiAgICAgICAgICAgICAgICBvbkNoYW5nZUJhY2tncm91bmRCdXR0b25DbGljaz17dGhpcy5vbkNoYW5nZUJhY2tncm91bmRCdXR0b25DbGlja31cbiAgICAgICAgICAgICAgICB6b29tSW49e3RoaXMuem9vbUlufVxuICAgICAgICAgICAgICAgIHpvb21PdXQ9e3RoaXMuem9vbU91dH1cbiAgICAgICAgICAgICAgICB6b29tUmVzZXQ9e3RoaXMucHJvcHMuem9vbVJlc2V0fVxuICAgICAgICAgICAgICAgIGZpbGVTaXplPXt0aGlzLmdldEZpbGVTaXplKCl9XG4gICAgICAgICAgICAgICAgc291cmNlSW1hZ2VWYWxpZGl0eT17dGhpcy5wcm9wcy5zb3VyY2VJbWFnZVZhbGlkaXR5fVxuICAgICAgICAgICAgICAgIG9uQnRuTW91c2VEb3duPXt0aGlzLm9uQnRuTW91c2VEb3dufVxuICAgICAgICAgICAgICAgIGFjdGl2ZUJ0bj17dGhpcy5zdGF0ZS5hY3RpdmVCdG59XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY29uc3QgbWFwVG9Qcm9wcyA9IChzdGF0ZTogSVN0YXRlKSA9PiAoeyBzb3VyY2U6IHN0YXRlLnNvdXJjZSwgc291cmNlSW1hZ2VWYWxpZGl0eTogc3RhdGUuc291cmNlSW1hZ2VWYWxpZGl0eSB9KTtcblxuZXhwb3J0IGRlZmF1bHQgY29ubmVjdChtYXBUb1Byb3BzLCBhY3Rpb25zKShUb29sYmFyQ29udGFpbmVyKTsiLCJpbXBvcnQgeyBoLCByZW5kZXIgfSBmcm9tICdwcmVhY3QnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWR1eC16ZXJvL3ByZWFjdCc7XG5pbXBvcnQgQXBwIGZyb20gJy4vQXBwJztcbmltcG9ydCBzdG9yZSBmcm9tICcuL3N0b3JlJztcbmltcG9ydCAnLi9tZXNzYWdpbmcnO1xuXG5yZW5kZXIoXG4gICAgPFByb3ZpZGVyIHN0b3JlPXtzdG9yZX0+PEFwcCAvPjwvUHJvdmlkZXI+LFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSBhcyBIVE1MRWxlbWVudFxuKTtcbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlcn0gIGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB2c2NvZGUgZnJvbSAnLi4vdnNjb2RlLWFwaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU1lc3NhZ2Uge1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICBwYXlsb2FkOiBhbnk7XG59XG5cbmNsYXNzIE1lc3NhZ2VCcm9rZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBjb21tYW5kLCBwYXlsb2FkIH0gPSBldmVudC5kYXRhO1xuXG4gICAgICAgICAgICB0aGlzLmVtaXQoY29tbWFuZCwgcGF5bG9hZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbmQobWVzc2FnZTogSU1lc3NhZ2UpIHtcbiAgICAgICAgdnNjb2RlLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1lc3NhZ2VCcm9rZXIoKTsiLCJpbXBvcnQgbWVzc2FnZUJyb2tlciBmcm9tICcuLyc7XG5cbmNvbnN0IFRFTEVNRVRSWV9FVkVOVF9aT09NID0gJ3pvb20nO1xuY29uc3QgVEVMRU1FVFJZX0VWRU5UX0NIQU5HRV9CQUNLR1JPVU5EID0gJ2NoYW5nZUJhY2tncm91bmQnO1xuXG5jbGFzcyBUZWxlbWV0cnlSZXBvcnRlciB7XG4gICAgc2VuZFpvb21FdmVudCh0eXBlOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKSB7XG4gICAgICAgIG1lc3NhZ2VCcm9rZXIuc2VuZCh7XG4gICAgICAgICAgICBjb21tYW5kOiAnc2VuZFRlbGVtZXRyeUV2ZW50JyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6IFRFTEVNRVRSWV9FVkVOVF9aT09NLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHsgdHlwZSwgc291cmNlIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VuZENoYW5nZUJhY2tncm91bmRFdmVudChmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpIHtcbiAgICAgICAgbWVzc2FnZUJyb2tlci5zZW5kKHtcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdzZW5kVGVsZW1ldHJ5RXZlbnQnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogVEVMRU1FVFJZX0VWRU5UX0NIQU5HRV9CQUNLR1JPVU5ELFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHsgZnJvbSwgdG8gfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBUZWxlbWV0cnlSZXBvcnRlcigpOyIsImltcG9ydCB7IElTdGF0ZSwgSVNvdXJjZSwgSUJhY2tncm91bmQgfSBmcm9tICcuL0lTdGF0ZSc7XG5pbXBvcnQgdnNjb2RlQXBpIGZyb20gJy4uL3ZzY29kZS1hcGknO1xuaW1wb3J0IHRlbGVtZXRyeVJlcG9ydGVyIGZyb20gJy4uL21lc3NhZ2luZy90ZWxlbWV0cnknO1xuXG5jb25zdCBERUZBVUxUX1NDQUxFX1NURVAgPSAwLjI7XG5jb25zdCBNSU5fU0NBTEUgPSAwLjE7XG5jb25zdCBNQVhfU0NBTEUgPSAyMDtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbnMgPSAoKSA9PiAoe1xuICAgIHVwZGF0ZVNvdXJjZTogKHN0YXRlOiBJU3RhdGUsIHNvdXJjZTogSVNvdXJjZSkgPT4ge1xuICAgICAgICB2c2NvZGVBcGkuc2V0U3RhdGUoc291cmNlKTtcbiAgICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIHNvdXJjZSwgc2NhbGU6IDEgfTtcbiAgICB9LFxuICAgIHpvb21JbjogKHN0YXRlOiBJU3RhdGUsIHN0ZXAgPSBERUZBVUxUX1NDQUxFX1NURVApID0+IHtcbiAgICAgICAgY29uc3QgbmV4dFNjYWxlID0gc3RhdGUuc2NhbGUgKyBzdGF0ZS5zY2FsZSAqIHN0ZXA7XG4gICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBzY2FsZTogbmV4dFNjYWxlIDw9IE1BWF9TQ0FMRSA/IG5leHRTY2FsZSA6IE1BWF9TQ0FMRSB9O1xuICAgIH0sXG4gICAgem9vbU91dDogKHN0YXRlOiBJU3RhdGUsIHN0ZXAgPSBERUZBVUxUX1NDQUxFX1NURVApID0+IHtcbiAgICAgICAgY29uc3QgbmV4dFNjYWxlID0gc3RhdGUuc2NhbGUgLSBzdGF0ZS5zY2FsZSAqIHN0ZXA7XG4gICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBzY2FsZTogbmV4dFNjYWxlID49IE1JTl9TQ0FMRSA/IG5leHRTY2FsZSA6IE1JTl9TQ0FMRSB9O1xuICAgIH0sXG4gICAgem9vbVJlc2V0OiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xuICAgICAgICB0ZWxlbWV0cnlSZXBvcnRlci5zZW5kWm9vbUV2ZW50KCdyZXNldCcsICd0b29sYmFyJyk7XG4gICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBzY2FsZTogMSB9O1xuICAgIH0sXG4gICAgY2hhbmdlQmFja2dyb3VuZDogKHN0YXRlOiBJU3RhdGUsIGJhY2tncm91bmQ6IElCYWNrZ3JvdW5kKSA9PiB7XG4gICAgICAgIHRlbGVtZXRyeVJlcG9ydGVyLnNlbmRDaGFuZ2VCYWNrZ3JvdW5kRXZlbnQoc3RhdGUuYmFja2dyb3VuZCwgYmFja2dyb3VuZCk7XG4gICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBiYWNrZ3JvdW5kIH07XG4gICAgfSxcbiAgICB0b2dnbGVTb3VyY2VJbWFnZVZhbGlkaXR5OiAoc3RhdGU6IElTdGF0ZSwgdmFsaWRpdHk6IGJvb2xlYW4pID0+ICh7IC4uLnN0YXRlLCBzb3VyY2VJbWFnZVZhbGlkaXR5OiB2YWxpZGl0eSB9KVxufSk7XG4iLCJpbXBvcnQgY3JlYXRlU3RvcmUgZnJvbSAncmVkdXgtemVybyc7XG5pbXBvcnQgeyBJU3RhdGUgfSBmcm9tICcuL0lTdGF0ZSc7XG5pbXBvcnQgdnNjb2RlQXBpIGZyb20gJy4uL3ZzY29kZS1hcGknO1xuXG5jb25zdCBpbml0aWFsU3RhdGU6IElTdGF0ZSA9IHtcbiAgICBzb3VyY2U6IHtcbiAgICAgICAgdXJpOiB2c2NvZGVBcGkuZ2V0U3RhdGUoKSA/IHZzY29kZUFwaS5nZXRTdGF0ZSgpLnVyaSA6IG51bGwsXG4gICAgICAgIGRhdGE6IHZzY29kZUFwaS5nZXRTdGF0ZSgpID8gdnNjb2RlQXBpLmdldFN0YXRlKCkuZGF0YSA6IG51bGwsXG4gICAgICAgIHNldHRpbmdzOiB2c2NvZGVBcGkuZ2V0U3RhdGUoKT8gdnNjb2RlQXBpLmdldFN0YXRlKCkuc2V0dGluZ3MgOiB7IHNob3dCb3VuZGluZ0JveDogZmFsc2UgfVxuICAgIH0sXG4gICAgc2NhbGU6IDEsXG4gICAgYmFja2dyb3VuZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpIS5jbGFzc0xpc3QuY29udGFpbnMoJ3ZzY29kZS1kYXJrJykgPyAnZGFyaycgOiAnbGlnaHQnLFxuICAgIHNvdXJjZUltYWdlVmFsaWRpdHk6IGZhbHNlLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlU3RvcmUoaW5pdGlhbFN0YXRlKTtcbmV4cG9ydCB7IGFjdGlvbnMgfSBmcm9tICcuL2FjdGlvbnMnO1xuZXhwb3J0IHsgSVN0YXRlLCBJU291cmNlIH0gZnJvbSAnLi9JU3RhdGUnOyIsImV4cG9ydCBmdW5jdGlvbiBnZXRCeXRlQ291bnRCeUNvbnRlbnQoIHM6IHN0cmluZyA9ICcnICk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDAsIHN0cmluZ0xlbmd0aCA9IHMubGVuZ3RoLCBpO1xuICBzID0gU3RyaW5nKCBzIHx8ICcnICk7XG4gIGZvciggaSA9IDAgOyBpIDwgc3RyaW5nTGVuZ3RoIDsgaSsrIClcbiAge1xuICAgIGNvbnN0IHBhcnRDb3VudCA9IGVuY29kZVVSSSggc1tpXSApLnNwbGl0KCclJykubGVuZ3RoO1xuICAgIGNvdW50ICs9IHBhcnRDb3VudCA9PT0gMSA/IDE6cGFydENvdW50LTE7XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5GaWxlU2l6ZShzaXplOiBudW1iZXIgPSAwKTogc3RyaW5nIHtcbiAgICB2YXIgaSA9IE1hdGguZmxvb3IoIE1hdGgubG9nKHNpemUpIC8gTWF0aC5sb2coMTAyNCkgKTtcbiAgICBjb25zdCBudW1iZXJQYXJ0ID0gKyggc2l6ZSAvIE1hdGgucG93KDEwMjQsIGkpICkudG9GaXhlZCgyKSAqIDE7XG4gICAgY29uc3Qgc3RyaW5nUGFydCA9IFsnQicsICdrQicsICdNQicsICdHQicsICdUQiddW2ldO1xuICAgIHJldHVybiBgJHtudW1iZXJQYXJ0fSAke3N0cmluZ1BhcnR9YDtcbn07IiwiaW50ZXJmYWNlIElWU0NvZGVBcGkge1xuICAgIGdldFN0YXRlKCk6IGFueTtcbiAgICBzZXRTdGF0ZShzdGF0ZTogYW55KTogdm9pZDtcbiAgICBwb3N0TWVzc2FnZShtZXNzYWdlOiBvYmplY3QpOiB2b2lkO1xufVxuXG5kZWNsYXJlIGZ1bmN0aW9uIGFjcXVpcmVWc0NvZGVBcGkoKTogSVZTQ29kZUFwaTtcblxuZXhwb3J0IGRlZmF1bHQgYWNxdWlyZVZzQ29kZUFwaSgpOyJdLCJzb3VyY2VSb290IjoiIn0=