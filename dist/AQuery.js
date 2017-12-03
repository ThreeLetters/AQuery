/*
 Aquery: The world's best DOM wrapper

 Author: Andrews54757
 License: MIT (https://github.com/ThreeLetters/AQuery/blob/master/LICENSE)
 Source: https://github.com/ThreeLetters/AQuery
 Build: v0.0.1
 Built on: 03/12/2017
*/

(function (window) {
// init.js
var config = {
    objectEdit: true

}

var elementMethods = {},
    queryMethods = {},
    AQueryMethods = {},
    elementCache = config.objectEdit ? {} : new Map(),
    refrenceListeners = [],
    nodeId = 0,
    AQuery,
    Head = {
        nodes: [],
        appendChild: function (node) {
            this.nodes.push(node)
        },
        removeChild: function (node) {
            var ind = this.nodes.indexOf(node);
            if (ind !== -1) this.node.splice(ind, 1)
        }
    },
    cssRefrences = {};

var customEvents = ['blur', 'focus', 'keydown', 'keyup', 'keypress', 'resize', 'scroll', 'select', 'submit', 'click', 'dblclick', 'change', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'contextmenu'];


window.addEventListener('load', function () {
    var head = document.head || document.getElementsByTagName("head")[0];
    Head.nodes.forEach((node) => {
        head.appendChild(node);
    })
    Head = head;
})

function createId() {
    return 'aquery_id_' + nodeId++;
}

function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// only implement if no native implementation is available
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};
// css/index.js
function css(element, property, value) {
    if (element.elementData) element = element.elementData.current;
    if (typeof property === 'object') {
        if (Array.isArray(property)) {
            return property.map((name) => {
                return getProperty(element, name)
            })
        } else {
            var out = {};
            for (var name in property) {
                out[name] = setProperty(element, name, property[name])
            }
            return out;
        }
    } else if (typeof property === 'string') {
        return (value !== undefined) ? setProperty(element, property, value) : getProperty(element, property)
    }

}

function getCssString(name) {

    return name.split('-').map((n, i) => {
        if (i !== 0) return capitalizeFirstLetter(n);
        return n;
    }).join('');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateCSSRefrence(styleElement) {
    var out = [styleElement.selector, ' {']
    for (var name in styleElement.style) {
        out.push(name, ':', styleElement.style[name], ';')
    }
    out.push('}')
    styleElement.element.innerHTML = '<br><style>' + out.join('') + '</style>'
}

elementMethods.css = function (elementData, refrence, type) {
    if (type === 'delete') {
        return elementData.current.removeAttribute('style');
    } else if (type === 'get') {
        return new Proxy(function (property, value) {
            return css(elementData.current, property, value)
        }, {
            deleteProperty: function (target, name) {
                css(elementData.current, name, '')
                return true;
            }
        });
    }
}

queryMethods.css = function (queryData, refrence, type) {
    if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';
    if (type === 'delete') {
        if (refrence) {
            if (cssRefrences[queryData.selector]) {
                Head.removeChild(cssRefrences[queryData.selector].element)
                cssRefrences[queryData.selector] = null;
                return true;
            }
            return false;
        } else {
            queryData.nodes.map((wrap) => {
                return wrap.current.removeAttribute('style');
            });
            return true;
        }
    } else if (type === 'get') {
        if (refrence) {
            return new Proxy(function (property, value) {
                if (typeof property === 'object') {
                    if (Array.isArray(property)) {
                        if (!cssRefrences[queryData.selector]) return false;
                        return property.map((name) => {
                            return cssRefrences[queryData.selector][getCssString(name)]
                        })
                    } else {
                        var out = {};
                        for (var name in property) {
                            out[name] = setPropertyRefrence(queryData, name, property[name])
                        }
                        return out;
                    }
                } else if (typeof property === 'string') {
                    return (value !== undefined) ? setPropertyRefrence(element, property, value) : cssRefrences[queryData.selector][getCssString(name)];
                }
            }, {
                deleteProperty: function (target, name) {
                    if (!cssRefrences[queryData.selector]) return false;
                    delete cssRefrences[queryData.selector].style[name];
                    updateCSSRefrence(cssRefrences[queryData.selector]);
                    return true;
                }
            })
        } else {
            return new Proxy(function (property, value) {
                return queryData.nodes.map((wrap) => {
                    return css(wrap, property, value)
                });
            }, {
                deleteProperty: function (target, name) {
                    queryData.nodes.map((wrap) => {
                        return css(wrap, name, '');
                    });
                    return true;
                }
            })
        }
    }
}

AQueryMethods.css = function () {
    return function (property, value, element) {
        if (element && typeof element === 'object') {
            return element.map((wrap) => {
                return css(wrap, property, value)
            })
        }
        return css(element || document.body, property, value)
    }
}
// css/getProperty.js
function getProperty(element, property) {
    property = getCssString(property);
    if (element.style[property]) return element.style[property];

    var styles = window.getComputedStyle(element);
    return styles.getPropertyValue(getPropertyString(property));
}

function getPropertyString(property) {
    return property.replace(/[A-Z]/g, function (a) {
        return '-' + a.toLowerCase();
    });
}
// css/setProperty.js
function setProperty(element, property, value) {
    property = getCssString(property);


    if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
        var value2 = parseFloat(value);
        var newValue = value2;
        var originalValueRaw = getProperty(element, property);
        var originalValue = parseFloat(originalValueRaw)
        var operator = value.charAt(0);
        var isFound = true;

        value2 = parseFloat(value.substr(2));

        switch (operator) {
            case '+':
                newValue = originalValue + value2;
                break;
            case '-':
                newValue = originalValue - value2;
                break;
            case '*':
                newValue = originalValue * value2;
                break;
            case '/':
                newValue = originalValue / value2;
                break;
            case '^':
                newValue = Math.pow(originalValue, value2);
                break;
            default:
                isFound = false;
                break;
        }
        if (isFound) {
            var ending = value.substr(value2.toString().length + 2);
            if (!ending) {
                ending = originalValueRaw.substr(originalValue.toString().length);
            }
            value = newValue + ending
        }
    }


    return element.style[property] = value.toString();
}

function setPropertyRefrence(queryData, property, value) {
    if (!cssRefrences[queryData.selector]) {
        var newStyleElement = document.createElement('div');
        newStyleElement.innerHTML = '<br><style>' + queryData.selector + ' {}</style>'
        Head.appendChild(newStyleElement);
        cssRefrences[queryData.selector] = {
            element: newStyleElement,
            style: {},
            selector: queryData.selector
        }
    }
    var styleElement = cssRefrences[queryData.selector];
    property = getCssString(property);
    var value2 = parseFloat(value);
    var newValue = value2;
    var originalValueRaw = styleElement.style[property];
    var originalValue = parseFloat(originalValueRaw)
    if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
        var operator = value.charAt(0);
        var isFound = true;

        value2 = parseFloat(value.substr(2));

        switch (operator) {
            case '+':
                newValue = originalValue + value2;
                break;
            case '-':
                newValue = originalValue - value2;
                break;
            case '*':
                newValue = originalValue * value2;
                break;
            case '/':
                newValue = originalValue / value2;
                break;
            case '^':
                newValue = Math.pow(originalValue, value2);
                break;
            default:
                isFound = false;
                break;
        }
        if (isFound) {
            value = value.substr(2);
        }
    }

    var ending = value.substr(value2.toString().length);
    if (!ending) {
        ending = originalValueRaw.substr(originalValue.toString().length);
    }

    styleElement.style[property] = newValue + ending;
    updateCSSRefrence(styleElement);
    return styleElement.style[property];
}
// methods/ajax.js
var minirequest = function ( /**/ ) {
    var url = arguments[0],
        post = undefined,
        callback,
        bust = false;

    if (arguments[2]) { // post
        post = arguments[1];
        callback = arguments[2];
        bust = arguments[3];
    } else {
        callback = arguments[1];
        bust = arguments[2];
    }
    try {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); // IE support
        xhr.open(post ? 'POST' : 'GET', url + (bust ? ("?" + Date.now()) : ""));
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    callback(undefined, xhr, xhr.responseText);
                } else {
                    callback(true, xhr, false);
                }

                var body = xhr.responseText;
                var res = xhr
            }
        };
        if (post) {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            var toPost = [];
            for (var i in post) {
                toPost.push(encodeURIComponent(i) + '=' + encodeURIComponent(post[i]))
            }

            post = toPost.join("&")
        }

        xhr.send(post);
    } catch (e) {
        callback(e);
    }
}


/*
Modified derivative of Ajax (https://github.com/ForbesLindesay/ajax)

Copyright (c) 2013 Forbes Lindesay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var jsonpID = 0,
    document = window.document,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/

var ajax = function (options, useMini) {
    if (useMini) {
        return minirequest.apply(null, arguments)
    }
    var settings = extend({}, options || {})
    for (key in ajax.settings)
        if (settings[key] === undefined) settings[key] = ajax.settings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
        RegExp.$2 != window.location.host

    var dataType = settings.dataType,
        hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
        return ajax.JSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = {},
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = ajax.settings.xhr(),
        abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
        baseHeaders['Accept'] = mime
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
        baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            clearTimeout(abortTimeout)
            var result, error = false
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
                result = xhr.responseText

                try {
                    if (dataType == 'script')(1, eval)(result)
                    else if (dataType == 'xml') result = xhr.responseXML
                    else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                } catch (e) {
                    error = e
                }

                if (error) ajaxError(error, 'parsererror', xhr, settings)
                else ajaxSuccess(result, xhr, settings)
            } else {
                ajaxError(null, 'error', xhr, settings)
            }
        }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort()
        return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
    }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
}


// trigger a custom event and return false if it was cancelled
function triggerAndReturn(context, eventName, data) {
    //todo: Fire off some events
    //var event = $.Event(eventName)
    //$(context).trigger(event, data)
    return true; //!event.defaultPrevented
}

// trigger an Ajax "global" event
function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
}

// Number of active Ajax requests
ajax.active = 0

function ajaxStart(settings) {
    if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
}

function ajaxStop(settings) {
    if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
}

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
        return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
}

function ajaxSuccess(data, xhr, settings) {
    var context = settings.context,
        status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
}
// type: "timeout", "error", "abort", "parsererror"
function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
}
// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
}

// Empty function, used as default callback
function empty() {}

ajax.JSONP = function (options) {
    if (!('type' in options)) return ajax(options)

    var callbackName = 'jsonp' + (++jsonpID),
        script = document.createElement('script'),
        abort = function () {
            //todo: remove script
            //$(script).remove()
            if (callbackName in window) window[callbackName] = empty
            ajaxComplete('abort', xhr, options)
        },
        xhr = {
            abort: abort
        },
        abortTimeout,
        head = document.getElementsByTagName("head")[0] ||
        document.documentElement

    if (options.error) script.onerror = function () {
        xhr.abort()
        options.error()
    }

    window[callbackName] = function (data) {
        clearTimeout(abortTimeout)
        //todo: remove script
        //$(script).remove()
        delete window[callbackName]
        ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)

    // Use insertBefore instead of appendChild to circumvent an IE6 bug.
    // This arises when a base node is used (see jQuery bugs #2709 and #4378).
    head.insertBefore(script, head.firstChild);

    if (options.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
    }, options.timeout)

    return xhr
}

ajax.settings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
        return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
        script: 'text/javascript, application/javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
}

function mimeToDataType(mime) {
    return mime && (mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
        xmlTypeRE.test(mime) && 'xml') || 'text'
}

function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

// serialize payload and append it to the URL for GET requests
function serializeData(options) {
    if (type(options.data) === 'object') options.data = param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
        options.url = appendQuery(options.url, options.data)
}

ajax.get = function (url, success) {
    return ajax({
        url: url,
        success: success
    })
}

ajax.post = function (url, data, success, dataType) {
    if (type(data) === 'function') dataType = dataType || success, success = data, data = null
    return ajax({
        type: 'POST',
        url: url,
        data: data,
        success: success,
        dataType: dataType
    })
}

ajax.getJSON = function (url, success) {
    return ajax({
        url: url,
        success: success,
        dataType: 'json'
    })
}

var escape = encodeURIComponent

function serialize(params, obj, traditional, scope) {
    var array = type(obj) === 'array';
    for (var key in obj) {
        var value = obj[key];

        if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
        // handle data in serializeArray() format
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
            serialize(params, value, traditional, key)
        else params.add(key, value)
    }
}

function param(obj, traditional) {
    var params = []
    params.add = function (k, v) {
        this.push(escape(k) + '=' + escape(v))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
}

function extend(target) {
    var slice = Array.prototype.slice;
    slice.call(arguments, 1).forEach(function (source) {
        for (key in source)
            if (source[key] !== undefined)
                target[key] = source[key]
    })
    return target
}

AQueryMethods.ajax = function () {
    return ajax;
}
// methods/animate.js

// methods/append.js
elementMethods.append = elementMethods.appendChild = function (elementData, refrence) {

    return function (child) {
        if (!child.elementData) {
            child = wrapElement(child);
        }
        var data = child.elementData;
        refrenceListeners.forEach((listener) => {
            if (data.current.matches(listener.selector) && data.listeners.indexOf(listener) === -1) {
                data.current.addEventListener(listener.type, listener.listener, listener.options)
                data.listeners.push(listener);
            }
        })
        elementData.current.appendChild(data.current);
    }

}

AQueryMethods.append = AQueryMethods.appendChild = function () {
    return function (child) {
        if (!child.elementData) {
            child = wrapElement(child);
        }
        var data = child.elementData;
        refrenceListeners.forEach((listener) => {
            if (data.current.matches(listener.selector) && data.listeners.indexOf(listener) === -1) {
                data.current.addEventListener(listener.type, listener.listener, listener.options)
                data.listeners.push(listener);
            }
        });
        document.body.appendChild(data.current);
    }
}
// methods/attr.js
 elementMethods.attr = function (elementData, refrence, type, value) {

     return new Proxy(function (name, value) {

         if (value !== undefined) {
             elementData.current.setAttribute(name, value)
             return value;
         } else {
             return elementData.current.getAttribute(name);
         }
     }, {
         deleteProperty: function (target, name) {
             elementData.current.removeAttribute(name);
             return true;
         }
     })

 }
// methods/clone.js
elementMethods.clone = function (elementData, refrence) {
    return function (cloneEvents) {
        var clone = elementData.current.cloneNode(true);
        var wrap = AQuery(clone);
        if (cloneEvents !== false) elementData.listeners.forEach((listener) => {
            wrap.elementData.listeners.push(listener);
            wrap.elementData.current.addEventListener(listener.type, listener.listener, listener.options)
        });
        return wrap;
    }
}
// methods/dimensions.js
var types = ['', 'inner', 'outer', 'whole'];
var dimensions = ['width', 'height'];
dimensions.forEach((dimension, dim) => {
    types.forEach((extra, type) => {
        var dimensionStr = dimension;
        if (extra) dimensionStr = dimension.charAt(0).toUpperCase() + dimension.substr(1);
        var str = extra + dimensionStr;
        elementMethods[str] = function (elementData, refrence, actiontype, setvalue) {
            var offset = 0;
            if (type) {
                offset += parseFloat(css(elementData.current, dim ? 'padding-top' : 'padding-left'));
                offset += parseFloat(css(elementData.current, dim ? 'padding-bottom' : 'padding-right'));
                if (type >= 2) {
                    offset += parseFloat(css(elementData.current, dim ? 'border-top-width' : 'border-left-width'));
                    offset += parseFloat(css(elementData.current, dim ? 'border-bottom-width' : 'border-right-width'));
                    if (type === 3) {
                        offset += parseFloat(css(elementData.current, dim ? 'margin-top' : 'margin-left'));
                        offset += parseFloat(css(elementData.current, dim ? 'margin-bottom' : 'margin-right'));
                    }
                }
            }
            if (setvalue && type) {
                setvalue = parseFloat(setvalue) - offset;
            }
            var value = parseFloat(css(elementData.current, dimension, setvalue));
            return value + offset;
        }
    });
})



AQueryMethods.width = function (refrence, type) {
    if (type === 'get') {
        return Math.max(document.scrollHeight, document.offsetHeight, document.clientHeight)
    }
}
AQueryMethods.height = function (refrence, type) {
    if (type === 'get') {
        return Math.max(document.scrollWidth, document.offsetWidth, document.clientWidth)
    }
}
// methods/eventShortcuts.js
function generateElementEvent(eventType) {
    return function (elementData, refrence, type) {
        if (type === 'delete') {
            elementData.listeners = elementData.listeners.filter((l) => {
                if (l.type === eventType) {
                    elementData.current.removeEventListener(l.type, l.listener)
                    return false;
                }
                return true;
            });
        } else {

            return new Proxy(function (listener, options) {
                if (!listener) {
                    elementData.current[eventType]();
                    return;
                }

                listener._listenerData = listener._listenerData || {
                    type: eventType,
                    listener: listener,
                    options: options
                }
                if (elementData.listeners.indexOf(listener._listenerData) === -1) {
                    elementData.current.addEventListener(eventType, listener, options)
                    elementData.listeners.push(listener._listenerData)
                }
            }, {
                get: function (target, name) {
                    var list = elementData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (name === 'length') {
                        return list.length;
                    } else
                    if (!isNaN(name)) {
                        return list[name].listener;
                    }
                },
                deleteProperty: function (target, name) {
                    var list = elementData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (!isNaN(name)) {
                        var l = list[name];
                        if (!l) return;
                        var ind = elementData.listeners.indexOf(l);
                        elementData.listeners.splice(ind, 1);
                        elementData.current.removeEventListener(eventType, l.listener)
                    }
                }
            })
        }
    }
}

function generateQueryEvent(eventType) {
    return function (queryData, refrence, type) {
        if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';
        if (type === 'delete') {
            queryData.listeners = queryData.listeners.filter((l) => {
                if (l.type === eventType) {
                    queryData.nodes.forEach((wrap) => {
                        var data = wrap.elementData;
                        var index = data.listeners.indexOf(listener);
                        if (index !== -1) {
                            data.listeners.splice(index, 1)
                            data.current.removeEventListener(listener.type, listener.listener)
                        }
                    });
                    return false;
                }
                return true;
            });
            return true;
        } else {
            return new Proxy(function (listener, options) {
                if (!listener) {

                    queryData.nodes.forEach((wrapper) => {
                        wrapper.elementData.current[eventType]();
                    })

                    return;
                }
                var listenerData = listener._listenerData = listener._listenerData || {
                    selector: queryData.selector,
                    type: eventType,
                    listener: listener,
                    options: options
                }
                if (queryData.listeners.indexOf(listenerData) === -1)
                    queryData.listeners.push(listenerData)
                queryData.nodes.forEach((node, i) => {
                    var data = node.elementData;
                    if (data.listeners.indexOf(listenerData) !== -1) return;
                    data.current.addEventListener(eventType, listener, options)
                    data.listeners.push(listenerData)
                });
                if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
            }, {
                get: function (target, name) {
                    var list = queryData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (name === 'length') {
                        return list.listeners.length;
                    } else
                    if (!isNaN(name)) {
                        return list.listeners[name].listener;
                    }
                },
                deleteProperty: function (target, name) {
                    var list = queryData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (!isNaN(name)) {
                        var l = list[name];
                        if (!l) return;
                        var ind = queryData.listeners.indexOf(l);
                        queryData.listeners.splice(ind, 1);
                        if (l.isRefrenceEvent) {
                            var ind = refrenceListeners.indexOf(l);
                            refrenceListeners.splice(ind, 1);
                            l.isRefrenceEvent = false;
                        }
                        queryData.nodes.forEach((wrap) => {
                            var data = wrap.elementData;
                            var index = data.listeners.indexOf(l);
                            if (index !== -1) {
                                data.current.removeEventListener(l.type, l.listener)
                                data.listeners.splice(index, 1)
                            }
                        })
                    }
                }
            })
        }
    }
}



customEvents.forEach((event) => {
    elementMethods[event] = generateElementEvent(event)
    queryMethods[event] = generateQueryEvent(event)

});
// methods/events.js
elementMethods.on = elementMethods.addEventListener = function (elementData, refrence, type) {
    if (type === 'delete') {
        elementData.listeners.forEach((listener) => {
            elementData.current.removeEventListener(listener.type, listener.listener)
        })
        elementData.listeners = [];
    } else {

        return new Proxy(function (type, listener, options) {
            if (!listener) {
                if (customEvents.indexOf(type) !== -1) {
                    elementData.current[type]()
                } else {
                    elementData.listeners.forEach((listener) => {
                        if (listener.type === type) {
                            listener.listener.apply(elementData.current, []);
                        }
                    })
                }
                return;
            }
            listener._listenerData = listener._listenerData || {
                type: type,
                listener: listener,
                options: options
            }
            if (elementData.listeners.indexOf(listener._listenerData) === -1) {
                elementData.current.addEventListener(type, listener, options)
                elementData.listeners.push(listener._listenerData)
            }
        }, {
            get: function (target, name) {
                if (name === 'length') {
                    return elementData.listeners.length;
                } else
                if (!isNaN(name)) {
                    return elementData.listeners[name].listener;
                } else {
                    var newList = []
                    elementData.listeners.forEach((l) => {
                        if (l.type === name) {
                            newList.push(l.listener);
                        }
                    })
                    return new Proxy(newList, {
                        deleteProperty: function (target, name) {
                            if (!isNaN(name)) {
                                var l = newList[name];
                                if (!l) return;
                                l = l._listenerData
                                newList.splice(name, 1);
                                var ind = elementData.listeners.indexOf(l);
                                if (l !== -1) elementData.listeners.splice(ind, 1);
                                elementData.current.removeEventListener(l.type, l.listener)
                            }
                        }
                    });
                }
            },
            deleteProperty: function (target, name) {
                if (!isNaN(name)) {
                    var l = elementData.listeners[name];
                    if (!l) return;
                    elementData.listeners.splice(name, 1);
                    elementData.current.removeEventListener(l.type, l.listener)
                } else {
                    elementData.listeners = elementData.listeners.filter((l) => {
                        if (l.type === name) {
                            elementData.current.removeEventListener(l.type, l.listener)
                            return false;
                        }
                        return true;
                    })
                }
            }
        })
    }
}

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence, type) {
    if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';
    if (type === 'delete') {
        queryData.listeners.forEach((listener) => {
            queryData.nodes.forEach((wrap) => {
                var data = wrap.elementData;
                var index = data.listeners.indexOf(listener);
                if (index !== -1) {
                    data.listeners.splice(index, 1)
                    data.current.removeEventListener(listener.type, listener.listener)
                }
            })
        })
        queryData.listeners = [];
    } else {
        return new Proxy(function (type, listener, options) {
            if (!listener) {
                if (customEvents.indexOf(type) !== -1) {
                    queryData.nodes.forEach((wrapper) => {
                        wrapper.elementData.current[type]()
                    })
                } else {
                    queryData.listeners.forEach((listener) => {
                        if (listener.type === type) {
                            queryData.nodes.forEach((wrapper) => {
                                if (wrapper.elementData.listeners.indexOf(listener) !== -1)
                                    listener.listener.apply(wrapper.elementData.current, []);
                            })
                        }
                    })
                }
                return;
            }
            var listenerData = listener._listenerData = listener._listenerData || {
                selector: queryData.selector,
                type: type,
                listener: listener,
                options: options
            }
            if (queryData.listeners.indexOf(listenerData) === -1)
                queryData.listeners.push(listenerData)
            queryData.nodes.forEach((node, i) => {
                var data = node.elementData;
                if (data.listeners.indexOf(listenerData) !== -1) return;
                data.current.addEventListener(type, listener, options)
                data.listeners.push(listenerData)
            });
            if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
        }, {
            get: function (target, name) {
                if (name === 'length') {
                    return queryData.listeners.length;
                } else
                if (!isNaN(name)) {
                    return queryData.listeners[name].listener;
                } else {
                    var newList = []
                    queryData.listeners.forEach((l) => {
                        if (l.type === name) {
                            newList.push(l.listener);
                        }
                    })
                    return new Proxy(newList, {
                        deleteProperty: function (target, name) {
                            if (typeof name === 'number') {
                                var l = newList[name];
                                if (!l) return;
                                l = l._listenerData
                                newList.splice(name, 1);
                                var ind = queryData.listeners.indexOf(l);
                                if (l !== -1) queryData.listeners.splice(ind, 1);
                                if (l.isRefrenceEvent) {
                                    var ind = refrenceListeners.indexOf(l);
                                    refrenceListeners.splice(ind, 1);
                                    l.isRefrenceEvent = false;
                                }
                                queryData.nodes.forEach((wrap) => {
                                    var data = wrap.elementData;
                                    var index = data.listeners.indexOf(l);
                                    if (index !== -1) {
                                        data.current.removeEventListener(l.type, l.listener)
                                        data.listeners.splice(index, 1)
                                    }
                                })
                            }
                        }
                    });
                }
            },
            deleteProperty: function (target, name) {
                if (!isNaN(name)) {
                    var l = queryData.listeners[name];
                    if (!l) return;
                    queryData.listeners.splice(name, 1);
                    if (l.isRefrenceEvent) {
                        var ind = refrenceListeners.indexOf(l);
                        refrenceListeners.splice(ind, 1);
                        l.isRefrenceEvent = false;
                    }
                    queryData.nodes.forEach((wrap) => {
                        var data = wrap.elementData;
                        var index = data.listeners.indexOf(l);
                        if (index !== -1) {
                            data.current.removeEventListener(l.type, l.listener)
                            data.listeners.splice(index, 1)
                        }
                    })
                } else {
                    queryData.listeners = queryData.listeners.filter((l) => {
                        if (l.type === name) {
                            if (l.isRefrenceEvent) {
                                var ind = refrenceListeners.indexOf(l);
                                refrenceListeners.splice(ind, 1);
                                l.isRefrenceEvent = false;
                            }
                            elementData.current.removeEventListener(l.type, l.listener)
                            queryData.nodes.forEach((wrap) => {
                                var data = wrap.elementData;
                                var index = data.listeners.indexOf(l);
                                if (index !== -1) {
                                    data.current.removeEventListener(l.type, l.listener)
                                    data.listeners.splice(index, 1)
                                }
                            })
                            return false;
                        }
                        return true;
                    })
                }
            }
        })
    }
}
// methods/insert.js
function insertAfter(referenceNode, newNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(referenceNode, newNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

elementMethods.before = function (elementData) {
    return function (element) {
        return insertBefore(elementData.proxy, element);
    }
}
elementMethods.after = function (elementData) {
    return function (element) {
        return insertAfter(elementData.proxy, element);
    }
}
// methods/loop.js
queryMethods.forEach = queryMethods.each = function (queryData, refrence, type) {
    return function (call) {
        queryData.nodes.forEach(call);
    }
}

queryMethods.every = queryMethods.each = function (queryData, refrence, type) {
    return function (call) {
        return queryData.nodes.every(call);
    }
}

queryMethods.map = function (queryData, refrence, type) {
    return function (call) {
        var newArray = [];
        queryData.nodes.forEach((node, index) => {
            var results = call(node, index);

            if (results === false || results === undefined) return;
            newArray.push(isElement(results) ? results : node);
        });
        return Query(newArray, refrence ? queryData.selector : null);
    }
}
// methods/scroll.js
// methods/serialize.js
// methods/shortcuts.js
var shortcuts = {
    text: 'textContent',
    html: 'innerHTML',
    val: 'value'
}

for (var to in shortcuts) {
    (function (to, from) {
        elementMethods[to] = function (elementData, refrence, type, value) {
            if (type === 'get') {
                return elementData.current[from];
            } else if (type === 'set') {
                return elementData.current[from] = value;
            } else if (type === 'delete') {
                return delete elementData.current[from];
            }
        }
    })(to, shortcuts[to])
}
// methods/visibility.js
function show(elementData) {
    if (elementData.current.style.display === 'none') elementData.current.style.display = elementData.defaultDisplay || '';
}

function hide(elementData) {
    if (elementData.current.style.display !== 'none') {
        elementData.defaultDisplay = elementData.current.style.display
        elementData.current.style.display = 'none'
    }
}

function toggle(elementData, override) {
    if ((elementData.current.style.display === 'none' || override === true) && override !== false) {
        show(elementData);
    } else {
        hide(elementData);
    }
}

elementMethods.show = function (elementData) {
    return function () {
        show(elementData)
    }
}
elementMethods.hide = function (elementData) {
    return function () {
        hide(elementData)
    }
}
elementMethods.toggle = function (elementData) {
    return function (override) {
        show(elementData, override)
    }
}

queryMethods.show = function (queryData) {
    return function () {
        queryData.hideState = false;
        queryData.nodes.forEach((wrapper) => {
            show(wrapper.elementData)
        })
    }
}
queryMethods.hide = function (queryData) {
    return function () {
        queryData.hideState = true;
        queryData.nodes.forEach((wrapper) => {
            hide(wrapper.elementData)
        })
    }
}
queryMethods.toggle = function (queryData) {
    return function (override) {
        if ((queryData.hideState || override === true) && override !== false) {
            queryData.hideState = false;
        } else {
            queryData.hideState = true;
        }
        queryData.nodes.forEach((wrapper) => {
            if (queryData.hideState) {
                hide(wrapper.elementData)
            } else {
                show(wrapper.elementData)
            }
        });
    }
}
// interface/proxyObject.js
function proxy(parent, current, name) {
    var bindings = {};
    var cache = {};
    var data = {
        bindings: bindings,
        parent: parent,
        current: current,
        name: name,
        listeners: []
    }
    var type = typeof current;
    var iselement = type === 'object' && isElement(current);

    var chain = false,
        chainResults = [];

    var proxyOut = new Proxy(current, {
        get: function (target, name) {
            var toReturn = undefined;
            if (name === 'elementData') {
                return data;
            } else if (name === 'chain') {
                chainResults = [];
                chain = true;
                return proxyout;
            } else if (name === 'end') {
                chain = false;
                var result = chainResults[chainResults.length - 1]
                return new Proxy(result, {
                    get: function (target, name) {
                        if (name === 'results') return chainResults;
                        else return result[name];
                    }
                });
            } else if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, true, 'get', undefined, name)
                } else {
                    if (!bindings[name]) bindings[name] = {
                        isRefrence: true,
                        owner: current,
                        attached: [],
                        name: name,
                        update: function (value) {
                            this.owner[this.name] = value;
                            this.attached.forEach((obj) => {
                                for (var name in obj.bindings) {
                                    if (obj.bindings[name] === this) obj.current[name] = value;
                                }
                            });
                        }
                    };
                    toReturn = bindings[name];
                }
            } else if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, false, 'get', undefined, name)
            } else if (current[name]) {
                if (typeof current[name] === 'object') {
                    if (!cache[name] || cache[name].elementData.current !== current[name]) {
                        cache[name] = isElement(current[name]) ? wrapElement(current[name]) : proxy(current, current[name], name);
                    }
                    toReturn = cache[name];
                } else toReturn = current[name];
            }
            return chain ? proxyOut : toReturn
        },
        set: function (target, name, value) {
            var refrence = false;
            var toReturn = undefined;
            if (name.charAt(0) === '$') name = name.substr(1), refrence = true;

            if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, true, 'set', value, name)
            } else {
                if (value && value.isRefrence) {
                    if (bindings[name] !== value) {
                        if (bindings[name]) {
                            var ind = bindings[name].attached.indexOf(data);
                            bindings[name].attached[ind] = bindings[name].attached[bindings[name].attached.length - 1]
                            bindings[name].attached[ind].pop();
                        }
                        value.attached.push(data);
                        current[name] = value.owner[value.name]
                        bindings[name] = value;
                    }
                } else {
                    if (bindings[name]) {
                        bindings[name].update(value)
                    } else {
                        current[name] = value;
                    }
                }
                toReturn = current[name];
            }
            return chain ? proxyOut : toReturn
        },
        deleteProperty: function (target, name) {
            var toReturn = undefined;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, true, 'delete', undefined, name)
                } else {
                    if (bindings[name]) {
                        if (bindings[name].owner === current) {
                            bindings[name].attached.forEach((obj) => {
                                for (var name2 in obj.bindings) {
                                    if (obj.bindings[name2] === bindings[name]) {
                                        obj.bindings[name2] = null;
                                        if (data.name === 'style') obj.current[name2] = '';
                                        else delete obj.current[name2];
                                    }
                                }
                            })
                            bindings[name].attached = null;
                        } else {
                            var ind = bindings[name].attached.indexOf(data);
                            bindings[name].attached[ind] = bindings[name].attached[bindings[name].attached.length - 1]
                            bindings[name].attached.pop();
                        }
                        bindings[name] = null;
                        if (data.name === 'style') current[name] = '';
                        else delete current[name];
                        toReturn = true;
                    } else if (data.name === 'style') current[name] = '', toReturn = true;
                    else toReturn = delete current[name];
                }
            } else if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, false, 'delete', undefined, name)
            } else {
                if (data.name === 'style') current[name] = '', toReturn = true;
                else toReturn = delete current[name];
            }
            return chain ? proxyOut : toReturn
        }
    });
    data.proxy = proxyOut;
    return proxyOut;
}
// interface/elementWrapper.js
function wrapElement(element) {
    if (element.elementData) return element;
    if (config.objectEdit) {
        if (!element.id) {
            element.id = createId()
        }
        if (!elementCache[element.id]) {
            elementCache[element.id] = proxy(null, element, null)
        }
        return elementCache[element.id];
    } else {
        var get = elementCache.get(element);

        if (!get) {
            get = proxy(null, element, null)
            elementCache.set(element, get)
        }
        return get;
    }
}
// interface/queryWrapper.js
function Query(nodes, selector) {
    var object = {
        nodes: nodes.map((node) => {
            return wrapElement(node);
        }),
        selector: selector,
        selectorSplit: selector.split(/[> ]/),
        listeners: []
    }

    var chain = false;
    var chainResults = [];

    var proxyout = new Proxy(object.nodes, {
        get: function (target, name) {
            if (name === 'length') return object.nodes.length;
            else if (name === 'chain') {
                chainResults = [];
                chain = true;
                return proxyout;
            } else if (name === 'end') {
                chain = false;
                var result = chainResults[chainResults.length - 1]
                return new Proxy(result, {
                    get: function (target, name) {
                        if (name === 'results') return chainResults;
                        else return result[name];
                    }
                })
            }

            var toReturn = undefined;

            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }

            if (!isNaN(name) && object.nodes[name]) {
                toReturn = refrence ? object.nodes[name].elementData.current : object.nodes[name];
            } else
            if (queryMethods[name]) {
                toReturn = queryMethods[name](object, refrence, 'get', undefined, name);
            } else if (object.nodes.length === 1) toReturn = object.nodes[0][(refrence ? '$' : '') + name];
            else {

                function proxyList(array, parent, parname, func) {
                    return new Proxy(func || array, {
                        get: function (target, name) {
                            if (!isNaN(name)) {
                                return array[name];
                            } else if (name === 'length') {
                                return array.length;
                            } else if (name === 'listData') {
                                return array;
                            } else if (name === 'link') {
                                return function () {
                                    var initial = false;
                                    parname = parname.charAt(0) === '$' ? parname.substr(1) : parname;
                                    parent.forEach((node) => {
                                        if (!initial) initial = node['$' + parname];
                                        else node[parname] = initial;
                                    })
                                    return initial;
                                }
                            } else {
                                return proxyList(array.map((node) => {
                                    return node[name];
                                }), array, name, function () {
                                    return array.map((node) => {
                                        return node[name].apply(node, arguments)
                                    });
                                })
                            }
                        },
                        set: function (target, name, value) {
                            if (value.listData) {
                                var data = value.listData;
                                if (data.length === array.length) {
                                    return proxyList(array.map((node, i) => {
                                        return node[name] = data[i];
                                    }), array, name)
                                } else {
                                    return proxyList(array.map((node, i) => {
                                        return node[name] = data[0];
                                    }), array, name)
                                }
                            }
                            return proxyList(array.map((node) => {
                                return node[name] = value;
                            }), array, name)
                        },
                        deleteProperty: function (target, name, value) {
                            return proxyList(array.map((node) => {
                                return delete node[name];
                            }), array, name);
                        }
                    })
                }
                toReturn = proxyList(object.nodes.map((node) => {
                    return node[(refrence ? '$' : '') + name];
                }), object.nodes, (refrence ? '$' : '') + name, function () {
                    return object.nodes.map((node) => {
                        return node[(refrence ? '$' : '') + name].apply(node, arguments);
                    });
                });
            }
            return chain ? proxyout : toReturn;
        },
        set: function (target, name, value) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            var toReturn = undefined;
            if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'set', value, name);
            else if (object.nodes.length === 1) {
                toReturn = object.nodes[0][(refrence ? '$' : '') + name] = value;
            } else {
                toReturn = object.nodes.map((node) => {
                    return node[(refrence ? '$' : '') + name] = value;
                })
            }
            return chain ? proxyout : toReturn;
        },
        deleteProperty: function (target, name) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            var toReturn = undefined;
            if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'delete', undefined, name);
            else if (object.nodes.length === 1) {
                toReturn = delete object.nodes[0][(refrence ? '$' : '') + name];
            } else {
                toReturn = object.nodes.map((node) => {
                    return delete node[(refrence ? '$' : '') + name];
                })
            }
            return chain ? proxyout : toReturn;
        }
    })
    return proxyout;
}
// interface/mainInterface.js
function createMain() {
    var proxyout = new Proxy(function (selector) {
        if (!selector) return;
        else if (typeof selector === 'string') {
            var elements = select(selector);
            return Query(elements, selector)
        } else if (typeof selector === 'object') {
            if (Array.isArray(selector)) {
                return Query(selector, null)
            } else {
                if (selector.nodeType === 9) {
                    return proxyout;
                } else if (selector.nodeType === 1) {
                    return wrapElement(selector);
                }
            }
        }
    }, {
        get: function (target, name) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                refrence = true;
                name = name.substr(1)
            }
            if (AQueryMethods[name]) {
                return AQueryMethods[name](refrence, 'get', undefined, name)
            } else {
                return document[name];
            }
        },
        set: function (target, name, value) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                refrence = true;
                name = name.substr(1)
            }
            if (AQueryMethods[name]) {
                return AQueryMethods[name](refrence, 'set', value, name)
            } else {
                return document[name] = value;
            }
        },
        deleteProperty: function (target, name) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                refrence = true;
                name = name.substr(1)
            }
            if (AQueryMethods[name]) {
                return AQueryMethods[name](refrence, 'delete', undefined, name)
            } else {
                return delete document[name];
            }
        }
    });
    return proxyout;
}

function select(selector) {
    return Array.from(document.querySelectorAll(selector));
}
// index.js
AQuery = createMain();
window.AQuery = AQuery
if (!window.$) {
    window.$ = window.AQuery;
}
})(window)