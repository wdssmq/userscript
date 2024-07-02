/* eslint-disable */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mzPaiad = factory());
})(this, (function () { 'use strict';

  // Class D
  var D = function (selector, context) {
    return new D.fn.init(selector, context);
  };

  var document$1 = window.document,
    emptyArray = [],
    concat = emptyArray.concat,
    filter = emptyArray.filter,
    slice = emptyArray.slice,
    classCache = {},
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    table = document$1.createElement('table'),
    tableRow = document$1.createElement('tr'),
    containers = {
      'tr': document$1.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
      '*': document$1.createElement('div')
    },
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    tempParent = document$1.createElement('div'),
    isArray = Array.isArray || function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    },
    contains = document$1.documentElement.contains
      ? function (parent, node) {
        return parent !== node && parent.contains(node);
      }
      : function (parent, node) {
        while (node && (node = node.parentNode))
          if (node === parent) return true;
        return false;
      };

  function type(obj) {
    return obj == null
      ? String(obj)
      : class2type[toString.call(obj)] || 'object';
  }

  function isString(obj) {
    return typeof obj == 'string';
  }

  function isFunction(value) {
    return type(value) == 'function';
  }

  function isWindow(obj) {
    return obj != null && obj == obj.window;
  }

  function isObject(obj) {
    return type(obj) == 'object';
  }

  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      typeRes = type(obj);

    return 'function' != typeRes && !isWindow(obj) && (
      'array' == typeRes || length === 0 ||
      (typeof length == 'number' && length > 0 && (length - 1) in obj)
    );
  }

  function compact(array) {
    return filter.call(array, function (item) {
      return item != null;
    });
  }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
  }

  function flatten(array) {
    return array.length > 0 ? D.fn.concat.apply([], array) : array;
  }

  function isD(object) {
    return object instanceof D;
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg;
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value) {
    var klass = node.className || '',
      svg = klass && klass.baseVal !== undefined;

    if (value === undefined) return svg ? klass.baseVal : klass;
    svg ? (klass.baseVal = value) : (node.className = value);
  }

  D.fn = D.prototype = {
    constuctor: D,
    length: 0,
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    // D's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    init: function (selector, context) {
      var dom;
      // If nothing given, return an empty D collection
      if (!selector) {
        return this;
      }
      // Optimize for string selectors
      else if (typeof selector == 'string') {
        selector = selector.trim();
        // If it's a html fragment, create nodes from it
        // Note: In both Chrome 21 and Firefox 15, DOM error 12
        // is thrown if the fragment doesn't begin with <
        if (selector[0] == '<' && fragmentRE.test(selector)) {
          dom = D.fragment(selector, RegExp.$1, context);
          selector = null;
        }
        // If there's a context, create a collection on that context first, and select
        // nodes from there
        else if (context !== undefined) {
          return D(context).find(selector);
        }
        // If it's a CSS selector, use it to select nodes.
        else {
          dom = D.qsa(document$1, selector);
        }
      }
      // If a function is given, call it when the DOM is ready
      else if (isFunction(selector)) {
        return D(document$1).ready(selector);
      }
      // If a D collection is given, just return it
      else if (isD(selector)) {
        return selector;
      }
      // normalize array if an array of nodes is given
      else if (isArray(selector)) {
        dom = compact(selector);
      }
      // Wrap DOM nodes.
      else if (isObject(selector)) {
        dom = [selector], selector = null;
      }
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) {
        return D(context).find(selector);
      }
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else {
        dom = D.qsa(document$1, selector);
      }
      // create a new D collection from the nodes found
      return D.makeArray(dom, selector, this);
    },
    // Modify the collection by adding elements to it
    concat: function () {
      var i, value, args = [];
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i];
        args[i] = isD(value) ? value.toArray() : value;
      }
      return concat.apply(isD(this) ? this.toArray() : this, args);
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function (property) {
      return D.map(this, function (el) { return el[property]; });
    },
    toArray: function () {
      return this.get();
    },
    get: function (idx) {
      return idx === undefined
        ? slice.call(this)
        : this[idx >= 0 ? idx : idx + this.length];
    },
    size: function () {
      return this.length;
    },
    each: function (callback) {
      emptyArray.every.call(this, function (el, idx) {
        return callback.call(el, idx, el) !== false;
      });
      return this;
    },
    map: function (fn) {
      return D(D.map(this, function (el, i) { return fn.call(el, i, el); }));
    },
    slice: function () {
      return D(slice.apply(this, arguments));
    },
    first: function () {
      var el = this[0];
      return el && !isObject(el) ? el : D(el);
    },
    last: function () {
      var el = this[this.length - 1];
      return el && !isObject(el) ? el : D(el);
    },
    eq: function (idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
    }
  };

  D.extend = D.fn.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target;

      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !isFunction(target)) {
      target = {};
    }
    // Extend D itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (isPlainObject(copy) ||
            (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            // Never move original objects, clone them
            target[name] = D.extend(deep, clone, copy);
            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  };

  D.extend({
    // Make DOM Array
    makeArray: function (dom, selector, me) {
      var i, len = dom ? dom.length : 0;
      for (i = 0; i < len; i++) me[i] = dom[i];
      me.length = len;
      me.selector = selector || '';
      return me;
    },
    merge: function (first, second) {
      var len = +second.length,
        j = 0,
        i = first.length;
      for (; j < len; j++) first[i++] = second[j];
      first.length = i;
      return first;
    },
    // D's CSS selector
    qsa: function (element, selector) {
      var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        // Ensure that a 1 char tag name still gets checked
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        isSimple = simpleSelectorRE.test(nameOnly);
      return (
        // Safari DocumentFragment doesn't have getElementById
        element.getElementById && isSimple && maybeID)
        // eslint-disable-next-line no-cond-assign
        ? (found = element.getElementById(nameOnly))
          ? [found]
          : []
        : element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11
          ? []
          : slice.call(
            // DocumentFragment doesn't have getElementsByClassName/TagName
            isSimple && !maybeID && element.getElementsByClassName
              ? maybeClass
                // If it's simple, it could be a class
                ? element.getElementsByClassName(nameOnly)
                // Or a tag
                : element.getElementsByTagName(selector)
              // Or it's not simple, and we need to query all
              : element.querySelectorAll(selector)
          );
    },
    // Html -> Node
    fragment: function (html, name, properties) {
      var dom, nodes, container;

      // A special case optimization for a single tag
      if (singleTagRE.test(html)) dom = D(document$1.createElement(RegExp.$1));

      if (!dom) {
        if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
        if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
        if (!(name in containers)) name = '*';

        container = containers[name];
        container.innerHTML = '' + html;
        dom = D.each(slice.call(container.childNodes), function () {
          container.removeChild(this);
        });
      }

      if (isPlainObject(properties)) {
        nodes = D(dom);
        D.each(properties, function (key, value) {
          if (methodAttributes.indexOf(key) > -1) nodes[key](value);
          else nodes.attr(key, value);
        });
      }

      return dom;
    },
    matches: function (element, selector) {
      if (!selector || !element || element.nodeType !== 1) return false;
      var matchesSelector = element.matches || element.webkitMatchesSelector ||
        element.mozMatchesSelector || element.oMatchesSelector ||
        element.matchesSelector;
      if (matchesSelector) return matchesSelector.call(element, selector);
      // fall back to performing a selector:
      var match, parent = element.parentNode,
        temp = !parent;
      if (temp) (parent = tempParent).appendChild(element);
      match = ~D.qsa(parent, selector).indexOf(element);
      temp && tempParent.removeChild(element);
      return match;
    },
    each: function (elements, callback) {
      var i, key;
      if (likeArray(elements)) {
        for (i = 0; i < elements.length; i++)
          if (callback.call(elements[i], i, elements[i]) === false) return elements;
      } else {
        for (key in elements)
          if (callback.call(elements[key], key, elements[key]) === false) return elements;
      }
      return elements;
    },
    map: function (elements, callback) {
      var value, values = [],
        i, key;
      if (likeArray(elements))
        for (i = 0; i < elements.length; i++) {
          value = callback(elements[i], i);
          if (value != null) values.push(value);
        }
      else
        for (key in elements) {
          value = callback(elements[key], key);
          if (value != null) values.push(value);
        }
      return flatten(values);
    }
  });

  // Populate the class2type map
  D.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
  });

  D.fn.init.prototype = D.fn;

  function hasClass(name) {
    if (!name) return false;
    return emptyArray.some.call(this, function (el) {
      return this.test(className(el));
    }, classRE(name));
  }

  function addClass(name) {
    var classList = [];
    if (!name) return this;
    return this.each(function (idx) {
      if (!('className' in this)) return;
      classList = [];
      var cls = className(this),
        newName = funcArg(this, name, idx, cls);
      newName.split(/\s+/g).forEach(function (klass) {
        if (!D(this).hasClass(klass)) classList.push(klass);
      }, this);
      classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));
    });
  }

  function removeClass(name) {
    var classList = [];
    return this.each(function (idx) {
      if (!('className' in this)) return;
      if (name === undefined) return className(this, '');
      classList = className(this);
      funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
        classList = classList.replace(classRE(klass), ' ');
      });
      className(this, classList.trim());
    });
  }

  function attr(name, value) {
    var result;
    return (typeof name == 'string' && !(1 in arguments))
      ? (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null
        ? result
        : undefined)
      : this.each(function (idx) {
        if (this.nodeType !== 1) return;
        if (isObject(name))
          for (var key in name) setAttribute(this, key, name[key]);
        else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
      });
  }

  function removeAttr(name) {
    return this.each(function () {
      this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
        setAttribute(this, attribute);
      }, this);
    });
  }

  function find(selector) {
    var result, $this = this;
    if (!selector) result = D();
    else if (typeof selector == 'object')
      result = D(selector).filter(function () {
        var node = this;
        return emptyArray.some.call($this, function (parent) {
          return contains(parent, node);
        });
      });
    else if (this.length == 1) result = D(D.qsa(this[0], selector));
    else result = this.map(function () { return D.qsa(this, selector); });
    return result;
  }

  var _zid = 1,
    handlers = {},
    focusinSupported = 'onfocusin' in window,
    focus = { focus: 'focusin', blur: 'focusout' },
    hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
    returnTrue = function () { return true; },
    returnFalse = function () { return false; },
    eventMethods = {
      preventDefault: 'isDefaultPrevented',
      stopImmediatePropagation: 'isImmediatePropagationStopped',
      stopPropagation: 'isPropagationStopped'
    };

  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event);

      D.each(eventMethods, function (name, predicate) {
        var sourceMethod = source[name];
        event[name] = function () {
          this[predicate] = returnTrue;
          return sourceMethod && sourceMethod.apply(source, arguments);
        };
        event[predicate] = returnFalse;
      });

      try {
        event.timeStamp || (event.timeStamp = Date.now());
      } catch (ignored) {
        console.warn(ignored);
      }

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
        'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue;
    }
    return event;
  }

  function parse(event) {
    var parts = ('' + event).split('.');
    return { e: parts[0], ns: parts.slice(1).sort().join(' ') };
  }

  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function (handler) {
      return handler
        && (!event.e || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector);
    });
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting;
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type;
  }

  function addEvent(element, events, fn, data, selector, delegator, capture) {
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function (event) {
      if (event == 'ready') return D(document$1).ready(fn);
      var handler = parse(event);
      handler.fn = fn;
      handler.sel = selector;
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function (e) {
        var related = e.relatedTarget;
        if (!related || (related !== this && !contains(this, related)))
          return handler.fn.apply(this, arguments);
      };
      handler.del = delegator;
      var callback = delegator || fn;
      handler.proxy = function (e) {
        e = compatible(e);
        if (e.isImmediatePropagationStopped()) return;
        e.data = data;
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
        if (result === false) e.preventDefault(), e.stopPropagation();
        return result;
      };
      handler.i = set.length;
      set.push(handler);
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
  }

  function removeEvent(element, events, fn, selector, capture) {
    var id = zid(element);
    (events || '').split(/\s/).forEach(function (event) {
      findHandlers(element, event, fn, selector).forEach(function (handler) {
        delete handlers[id][handler.i];
        if ('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
      });
    });
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event };
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

    return compatible(proxy, event);
  }

  function traverseNode(node, fn) {
    fn(node);
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fn);
  }

  // inside => append, prepend
  function domMani(elem, args, fn, inside) {
    // arguments can be nodes, arrays of nodes, D objects and HTML strings
    var argType,
      nodes = D.map(args, function (arg) {
        var arr = [];
        argType = type(arg);
        if (argType == 'array') {
          arg.forEach(function (el) {
            if (el.nodeType !== undefined) return arr.push(el);
            else if (isD(el)) return arr = arr.concat(el.get());
            arr = arr.concat(D.fragment(el));
          });
          return arr;
        }
        return argType == 'object' || arg == null ? arg : D.fragment(arg);
      }),
      parent,
      copyByClone = elem.length > 1;

    if (nodes.length < 1) return elem;

    return elem.each(function (_, target) {
      parent = inside ? target : target.parentNode;
      var parentInDocument = contains(document$1.documentElement, parent);

      nodes.forEach(function (node) {
        if (copyByClone) node = node.cloneNode(true);
        else if (!parent) return D(node).remove();

        fn.call(target, node);

        if (parentInDocument) {
          traverseNode(node, function (el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
              (!el.type || el.type === 'text/javascript') && !el.src) {
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window;
              target['eval'].call(target, el.innerHTML);
            }
          });
        }
      });
    });
  }

  function empty() {
    return this.each(function () {
      this.innerHTML = '';
    });
  }

  function html(html) {
    return 0 in arguments
      ? this.each(function (idx) {
        var originHtml = this.innerHTML;
        D(this).empty().append(funcArg(this, html, idx, originHtml));
      })
      : (0 in this ? this[0].innerHTML : null);
  }

  function text(text) {
    return 0 in arguments
      ? this.each(function (idx) {
        var newText = funcArg(this, text, idx, this.textContent);
        this.textContent = newText == null ? '' : '' + newText;
      })
      : (0 in this ? this.pluck('textContent').join('') : null);
  }

  function append() {
    return domMani(this, arguments, function (elem) {
      this.insertBefore(elem, null);
    }, true);
  }

  function on(event, selector, data, callback, one) {
    var autoRemove, delegator, $this = this;
    if (event && !isString(event)) {
      D.each(event, function (type, fn) {
        $this.on(type, selector, data, fn, one);
      });
      return $this;
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined;
    if (callback === undefined || data === false)
      callback = data, data = undefined;

    if (callback === false) callback = returnFalse;

    return $this.each(function (_, element) {
      if (one) autoRemove = function (e) {
        removeEvent(element, e.type, callback);
        return callback.apply(this, arguments);
      };

      if (selector) delegator = function (e) {
        var evt, match = D(e.target).closest(selector, element).get(0);
        if (match && match !== element) {
          evt = D.extend(createProxy(e), { currentTarget: match, liveFired: element });
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
        }
      };

      addEvent(element, event, callback, data, selector, delegator || autoRemove);
    });
  }

  var prefix = '',
    eventPrefix,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    testEl = document$1.createElement('div'),
    testTransitionProperty = testEl.style.transitionProperty;

  if (testEl.style.transform === undefined) D.each(vendors, function (vendor, event) {
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-';
      eventPrefix = event;
      return false;
    }
  });

  testEl = null;

  // fx cannot seperate
  function normalizeEvent(name) {
    return eventPrefix ? eventPrefix + name : name.toLowerCase();
  }

  D.fx = {
    off: (eventPrefix === undefined && testTransitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  };

  // Static methods
  // https://github.com/nzbin/domq#static-methods
  const methods = {
      // isArray,
  };

  // Instance methods
  // https://github.com/nzbin/domq#instance-methods
  const fnMethods = {
      addClass,
      append,
      attr,
      empty,
      find,
      hasClass,
      html,
      on,
      removeAttr,
      removeClass,
      text,
  };

  D.extend(methods);
  D.fn.extend(fnMethods);

  window.D = D;

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$1 = "@charset \"UTF-8\";\n.mz-hidden {\n  display: none;\n}\n\n.mz-reset * {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.mz-content code {\n  background-color: hsl(0, 0%, 96%);\n  color: hsl(348, 100%, 61%);\n  font-weight: 400;\n  padding: 0.25em 0.5em;\n}\n\n.mz-modal {\n  box-sizing: border-box;\n}\n\n.mz-modal__overlay, .mz-modal {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n\n.mz-modal {\n  display: none;\n}\n.mz-modal.is-open {\n  display: block;\n}\n.mz-modal * {\n  box-sizing: inherit;\n}\n\n.mz-modal__overlay {\n  background: rgba(0, 0, 0, 0.6);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.mz-modal__container {\n  background-color: #fff;\n  padding: 30px;\n  max-width: 540px;\n  min-width: 300px;\n  max-height: 100vh;\n  min-height: 30vh;\n  border-radius: 4px;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n\n.mz-modal__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid #e5e5e5;\n  padding-bottom: 0.3em;\n  margin-bottom: 0.7em;\n}\n\n.mz-modal__title {\n  display: flex;\n  align-items: center;\n  font-weight: 600;\n  font-size: 1.25rem;\n  line-height: 1.25;\n  color: #333;\n  box-sizing: border-box;\n}\n.mz-modal__title > span {\n  padding-right: 1em;\n}\n\n.mz-modal__close {\n  background: transparent;\n  border: 0;\n  cursor: pointer;\n  font-size: 1.25rem;\n  line-height: 1.25;\n}\n.mz-modal__close:before {\n  content: \"✕\";\n}\n.mz-modal__close:focus {\n  outline: 0;\n}\n\n.mz-modal__content {\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.8);\n}\n.mz-modal__content p:not(:last-child) {\n  margin-bottom: 0.7em;\n}\n\n.mz-modal__container {\n  min-width: 523px;\n}";
  styleInject(css_248z$1);

  var css_248z = ".js-mz-tips {\n  font-size: 12px;\n  padding-left: 4em;\n}\n\n.mz-content {\n  font-size: 16px;\n}\n.mz-content a:link, .mz-content a:visited {\n  color: #e60;\n  text-decoration: none;\n}\n.mz-content a:hover {\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}";
  styleInject(css_248z);

  class Modal {
      config = null;

      constructor({
          modalId,
          triggers = [],
          openClass = "is-open",
          disableCloseClass = "disable-close",
          openTrigger = "data-mz-modal-trigger",
          closeTrigger = "data-mz-modal-close",
          onShow = () => { },
          onClose = () => { },
          debugMode = false,
      }) {
          this.modal = document.getElementById(modalId);
          if (!this.modal) throw new Error(`Modal with ID ${modalId} not found.`);
          this.config = { openClass, disableCloseClass, openTrigger, closeTrigger, onShow, onClose, debugMode };
          if (debugMode) {
              console.log(modalId);
              console.log(this.modal);
          }
          if (triggers.length > 0) {
              this.registerTriggers(...triggers);
          }

          // 将 this 绑定到方法中
          this.onClick = this.onClick.bind(this);
          this.onKeydown = this.onKeydown.bind(this);
      }

      registerTriggers(...triggers) {
          triggers.filter(Boolean).forEach((trigger) => {
              trigger.addEventListener("click", event => this.showModal(event));
          });
      }

      onKeydown(event) {
          if (event.keyCode === 27) this.closeModal(event); // esc
          // if (event.keyCode === 9) this.retainFocus(event); // tab
      }

      onClick(event) {
          if (this.config.debugMode) {
              console.log(event.target);
              console.log(this.config);
          }
          if (
              event.target.hasAttribute(this.config.closeTrigger) ||
              event.target.parentNode.hasAttribute(this.config.closeTrigger)
          ) {
              event.preventDefault();
              event.stopPropagation();
              this.closeModal(event);
          }
      }

      addEventListeners() {
          this.modal.addEventListener("touchstart", this.onClick);
          this.modal.addEventListener("click", this.onClick);
          document.addEventListener("keydown", this.onKeydown);
      }

      removeEventListeners() {
          this.modal.removeEventListener("touchstart", this.onClick);
          this.modal.removeEventListener("click", this.onClick);
          document.removeEventListener("keydown", this.onKeydown);
      }

      showModal(event = null) {
          // this.activeElement = document.activeElement;
          this.modal.setAttribute("aria-hidden", "false");
          this.modal.classList.add(this.config.openClass);
          // this.scrollBehaviour("disable");
          this.addEventListeners();

          this.config.onShow({ modal: this.modal }, event);
      }

      closeModal(event = null) {
          const modal = this.modal;
          const isDisabled = modal.classList.contains(this.config.disableCloseClass);
          if (!isDisabled) {
              modal.setAttribute("aria-hidden", "true");
              this.removeEventListeners();
              // this.scrollBehaviour("enable");
              modal.classList.remove(this.config.openClass);
          }
          this.config.onClose({ modal, isDisabled }, event);
      }
  }

  const mzModal = (() => {

      let activeModal = null;

      // 同一个弹出层可以有多个触发器，对其进行关联
      const generateTriggerMap = (triggers, triggerAttr) => {
          const triggerMap = [];
          triggers.forEach((trigger) => {
              const modalId = trigger.attributes[triggerAttr].value;
              if (triggerMap[modalId] === undefined) triggerMap[modalId] = [];
              triggerMap[modalId].push(trigger);
          });

          return triggerMap;
      };

      // init
      const init = (config) => {
          const options = Object.assign({}, { openTrigger: "data-mz-modal-trigger" }, config);
          const triggers = [...document.querySelectorAll(`[${options.openTrigger}]`)];
          const triggerMap = generateTriggerMap(triggers, options.openTrigger);

          if (options.debugMode) {
              console.log("mzModal init");
              console.log(options);
              console.log(triggers);
          }

          for (const modalId in triggerMap) {
              if (Object.hasOwnProperty.call(triggerMap, modalId)) {
                  const arrEl = triggerMap[modalId];
                  options.modalId = modalId;
                  options.triggers = [...arrEl];
                  activeModal = new Modal(options);
              }
          }
      };

      // show
      const show = (modalId, config = null) => {
          const options = config || {};
          if (activeModal) activeModal.removeEventListeners();
          activeModal = new Modal({ modalId, ...options });
          activeModal.showModal();
      };

      return {
          init,
          show,
      };
  })();

  // localStorage 封装
  const lsObj = {
      setItem: function (key, value) {
          localStorage.setItem(key, JSON.stringify(value));
      },
      getItem: function (key, def = "") {
          const item = localStorage.getItem(key);
          if (item) {
              return JSON.parse(item);
          }
          return def;
      },
  };

  var tplHtml = "<!-- [1] -->\n<div id=\"{modal-id}\" class=\"mz-modal mz-reset\" aria-hidden=\"true\">\n    <!-- [2] -->\n    <div tabindex=\"-1\" class=\"mz-modal__overlay\" data-mz-modal-close>\n        <!-- [3] -->\n        <div role=\"dialog\" class=\"mz-modal__container\" aria-modal=\"true\" aria-labelledby=\"{modal-id}-title\">\n            <header class=\"mz-modal__header\">\n                <h2 id=\"{modal-id}-title\" class=\"mz-modal__title\">\n                    {title}\n                </h2>\n                <!-- [4] -->\n                <button class=\"mz-modal__close\" aria-label=\"Close modal\" data-mz-modal-close></button>\n            </header>\n            <div id=\"{modal-id}-content\" class=\"mz-modal__content mz-content\">\n                {content}\n            </div>\n        </div>\n    </div>\n</div>\n";

  var msgContent = "<p>这是一条弹出公告，你可能需要多看一会儿才能关闭；</p>\n<p>或者使用 <a href=\"https://cn.bing.com/search?q=uBlock+Origin\" title=\"uBlock Origin - 必应搜索\">uBlock Origin</a> 等广告过滤插件永久屏蔽；</p>\n<p><code>{location.hostname}##.mz-modal.ads</code></p>\n<p>「<a href=\"https://afdian.net/a/wdssmq\" title=\"沉冰浮水正在创作和 Z-BlogPHP 相关或无关的各种有用或没用的代码 | 爱发电\">爱发电</a>」\n「<a href=\"https://jq.qq.com/?_wv=1027&amp;k=SRYaRV6T\" title=\"QQ 群 - 我的咸鱼心\">QQ 群 - 我的咸鱼心</a>」\n「群号：189574683」</p>\n";

  const defConfig = {
      // 关闭倒计时
      cntDownMax: 5,
      // 弹出间隔
      interval: 86400 * 4,
      // 弹出内容
      msg: {
          title: "这里是标题（弹出间隔 {IntervalText}）",
          content: msgContent.trim().replace("{location.hostname}", location.hostname),
      },
      adsFlag: false,
  };

  class paidOrAd {
      $modal = null;
      $modalOverlay = null;
      cntDownCur = defConfig.cntDownMax;
      cntDownRunning = false;
      config = defConfig;
      domCreated = false;
      lsData = null;
      modalId = "paiad";
      modalOpts = {}; // 用于传给 mzModal 的配置
      NODE_ENV = "prod";
      ts = Math.floor(Date.now() / 1000);

      constructor(options = {}) {
          // 合并配置
          this.modalOpts = Object.assign({}, {
              onClose: this._onClose.bind(this),
              onShow: this._onShow.bind(this),
          }, options);
          // 初始化
          this.init();
      }

      _onClose(args) {
          // console.log(args);
          const $tips = this.$modal.find(".js-mz-tips");
          if (args.isDisabled) {
              // const $modal = $(args.modal);
              $tips.removeClass("mz-hidden");
          } else {
              $tips.addClass("mz-hidden");
          }
          // 倒计时结束后才允许关闭
          this.cntDown();
      }

      _onShow(args) {
          // console.log(args);
          this.cntDownCur = this.config.cntDownMax;
          this.disableClose();
      }

      init() {
          this.lsData = lsObj.getItem(this.modalId, {});
          this.createDom();
          mzModal.init(this.modalOpts);
          this.preventAccidentalClose();
      }

      // 时间间隔转换为友好的显示
      get intervalText() {
          const interval = this.config.interval;
          if (interval < 3600) {
              const minute = Math.floor(interval / 60);
              return `${minute} 分钟`;
          }
          if (interval < 86400) {
              const hour = Math.floor(interval / 3600);
              return `${hour} 小时`;
          }
          const day = Math.floor(interval / 3600 / 24);
          return `${day} 天`;
      }

      get intervalHour() {
          const interval = this.config.interval;
          const hour = Math.floor(interval / 3600);
          return hour;
      }

      get intervalDay() {
          const interval = this.config.interval;
          const day = Math.floor(interval / 3600 / 24);
          return day;
      }

      buildHtml() {
          return tplHtml
              .replace(/{modal-id}/g, this.modalId);
      }

      createDom() {
          const strHtml = this.buildHtml();
          if (!this.domCreated) {
              this.domCreated = true;
              D(document.body).append(strHtml);
          }
          this.$modal = D(`#${this.modalId}`);
          this.$modalOverlay = this.$modal.find(".mz-modal__overlay");
          // this.$modalOverlay.removeAttr("data-mz-modal-close");
      }

      // 更新 Dom 内容
      updateDom() {
          const $modalCon = this.$modal.find("#paiad-content");
          const modalCon = this.config.msg.content;
          $modalCon.html(modalCon);

          const $modalTitle = this.$modal.find("#paiad-title");
          const modalTitle = this.config.msg.title
              .replace("{IntervalHour}", this.intervalHour)
              .replace("{IntervalDay}", this.intervalDay)
              .replace("{IntervalText}", this.intervalText);
          $modalTitle.html(modalTitle);

          // 链接添加 target="_blank"
          this.$modal.find("a").attr("target", "_blank");

          // 追加元素
          $modalTitle.append("<span class=\"js-mz-tips mz-hidden\">{tips}</span>");
          // 添加额外的 class
          this.addClass();
      }

      // 防止非预期关闭
      preventAccidentalClose() {
          const _this = this;
          // this.$modal 绑定鼠标按下事件
          this.$modal.on("mousedown", (e) => {
              // 触发元素不为 .mz-modal__overlay 或 .mz-modal__close
              if (!e.target.classList.contains("mz-modal__overlay") && !e.target.classList.contains("mz-modal__close")) {
                  _this.$modalOverlay.removeAttr("data-mz-modal-close");
              } else {
                  _this.$modalOverlay.attr("data-mz-modal-close", "");
              }
          });
      }

      addClass() {
          if (this.config.adsFlag === false) return;
          this.$modal.addClass("ads");
      }

      setTips() {
          const _tips = (cnt) => {
              return cnt > 0 ? `${cnt} 秒后方可关闭` : "再次点击关闭→";
          };
          const $tips = this.$modal.find(".js-mz-tips");
          $tips.text(_tips(this.cntDownCur));
      }

      setLsData(key, value) {
          this.lsData[key] = value;
          lsObj.setItem(this.modalId, this.lsData);
      }

      // 倒计时封装
      cntDown() {
          if (this.cntDownRunning) {
              return;
          }
          this.cntDownRunning = true;
          this.setTips();
          const _this = this;
          const cnt = setInterval(() => {
              _this.cntDownCur -= 1;
              this.setTips();
              if (_this.cntDownCur <= 0) {
                  clearTimeout(cnt);
                  _this.enableClose();
              }
          }, 1000);
      }

      // 禁止关闭
      disableClose() {
          // console.log("disableClose");
          this.$modal.addClass("disable-close");
      }

      // 允许关闭
      enableClose() {
          this.$modal.removeClass("disable-close");
          this.cntDownRunning = false;
      }

      // 显示弹窗
      show(force = false) {
          this.updateDom();
          const lstShowTime = this.lsData.lstShowTime || 0;
          const interval = this.NODE_ENV === "dev" ? 10 : this.config.interval;

          // console.log("lstShowTime", lstShowTime);
          // console.log("interval", interval);
          // console.log("ts", this.ts);

          if (this.ts - lstShowTime > interval || force) {
              mzModal.show(this.modalId, this.modalOpts);
              this.setLsData("lstShowTime", this.ts);
          }
          return this;
      }
  }

  const paidOrAdInstance = new paidOrAd();

  return paidOrAdInstance;

}));
