/*
 Aquery: The world's best DOM wrapper

 Author: Andrews54757 & LegitSoulja
 License: MIT (https://github.com/ThreeLetters/AQuery/blob/master/LICENSE)
 Source: https://github.com/ThreeLetters/AQuery
 Build: v0.0.1
 Built on: 29/11/2017
*/

(function (window) {
var elementMethods = {},
    queryMethods = {},
    AQueryMethods = {},
    selectCache = {},
    elementCache = {},
    refrenceListeners = [],
    nodeId = 0,
    AQuery;

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

var ajax = AQueryMethods.ajax = function (options) {
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
elementMethods.clone = function (elementData, refrence) {
    return function () {

    }
}
elementMethods.on = elementMethods.addEventListener = function (elementData, refrence) {

    return function (type, listener, options) {
        listener._listenerData = listener._listenerData || {
            type: type,
            listener: listener,
            options: options
        }
        elementData.current.addEventListener(type, listener, options)
        elementData.listeners.push(listener._listenerData)
    }

}

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence) {

    return function (type, listener, options) {
        var listenerData = listener._listenerData = listener._listenerData || {
            selector: queryData.selector,
            type: type,
            listener: listener,
            options: options
        }
        queryData.nodes.forEach((node, i) => {
            node.addEventListener(type, listener, options)
            queryData.wrappers[i].listeners.push(listenerData)
        });
        if (refrence) refrenceListeners.push(listenerData);
    }
}
function wrapElement(element) {
    if (!element.id) {
        element.id = createId()
    }
    if (!elementCache[element.id]) {
        elementCache[element.id] = proxy(null, element, null)
    }
    return elementCache[element.id];
}

function proxy(parent, current, name) {
    var bindings = {};
    var data = {
        bindings: bindings,
        parent: parent,
        current: current,
        name: name,
        listeners: []
    }
    var type = typeof current;
    var iselement = type === 'object' && isElement(current);
    return new Proxy(current, {
        get: function (target, name) {
            if (name === 'elementData') {
                return data;
            } else
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    return elementMethods[name](data, true)
                } else {
                    if (!bindings[name]) bindings[name] = {
                        isRefrence: true,
                        owner: current,
                        attached: [],
                        name: name,
                        update: function (value) {
                            this.owner[this.name] = value;
                            this.attached.forEach((obj) => {
                                obj.current[this.name] = value;
                            });
                        }
                    };
                    return bindings[name];
                }
            } else if (iselement) {
                return elementMethods[name](data, false)
            } else if (current[name]) {
                if (typeof current[name] === 'object') return proxy(current, current[name], name);
                else return current[name];
            }
        },
        set: function (target, name, value) {
            if (name.charAt(0) === '$') name = name.substr(1);

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
        },
        has: function (target, name) {

        },
        deleteProperty: function (target, name) {
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (bindings[name]) {
                    if (bindings[name].owner === current) {
                        bindings[name].attached.forEach((att) => {
                            att.bindings[name] = null;
                        })
                        bindings[name].attached = null;
                    } else {
                        var ind = bindings[name].attached.indexOf(data);
                        bindings[name].attached[ind] = bindings[name].attached[bindings[name].attached.length - 1]
                        bindings[name].attached[ind].pop();
                    }
                    bindings[name] = null;
                }
            }
        }
    })
}
function Query(nodes, selector) {
    var object = {
        nodes: nodes,
        wrappers: [],
        selector: selector,
        selectorSplit: selector.split(/[> ]/)
    }

    nodes.forEach((node, i) => {
        object.wrappers[i] = wrapElement(node);
    })
    return new Proxy(object, {
        get: function (target, name) {
            if (name === 'length') return nodes.length;

            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            if (typeof name === 'number' && object.nodes[name]) {
                return refrence ? object.nodes[name] : object.wrappers[name];
            }
            if (queryMethods[name]) return queryMethods[name](object, refrence);
            else if (nodes.length === 1) return object.nodes[0][(refrence ? '$' : '') + name];
        },
        set: function (target, name, value) {

        }
    })
}
AQuery = new Proxy(function (selector) {
    if (!selector) return;
    else if (typeof selector === 'string') {
        var elements = select(selector);
        return Query(elements, selector)
    } else if (typeof selector === 'object') {
        return wrapElement(selector);
    }
}, {
    get: function (target, name) {
        if (AQueryMethods[name]) {
            return AQueryMethods[name](name)
        } else
        if (selectCache[name]) {
            return selectCache[name];
        }
    },
    set: function (target, name, value) {

    }
});


function select(selector) {
    return Array.from(document.querySelectorAll(selector));
}

window.AQuery = AQuery
if (!window.$) {
    window.$ = window.AQuery;
}
})(window)