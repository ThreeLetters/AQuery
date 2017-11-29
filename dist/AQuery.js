/*
 Aquery: The world's best DOM wrapper

 Author: Andrews54757 & LegitSoulja
 License: MIT (https://github.com/ThreeLetters/AQuery/blob/master/LICENSE)
 Source: https://github.com/ThreeLetters/AQuery
 Build: v0.0.1
 Built on: 28/11/2017
*/

(function (window) {
var elementMethods = {},
    queryMethods = {},
    selectCache = [],
    elementCache = {},
    refrenceListeners = [],
    nodeId = 0;

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
elementMethods.append = elementMethods.appendChild = function (elementData, refrence) {

    return function (child) {
        if (child.elementData) {
            child = child.elementData.current;
        }
        refrenceListeners.forEach((listener) => {
            if (child.matches(listener.selector)) {
                child.addEventListener(listener.type, listener.listener, listener.options)
            }
        })
        elementData.current.appendChild(child);
    }

}
elementMethods.on = elementMethods.addEventListener = function (elementData, refrence) {

    return function (type, listener, options) {
        elementData.current.addEventListener(type, listener, options)
    }

}

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence) {
    if (refrence) {
        return function (type, listener, options) {
            queryData.nodes.forEach((node) => {
                node.addEventListener(type, listener, options)
            });
            refrenceListeners.push({
                selector: queryData.selector,
                type: type,
                listener: listener,
                options: options
            })
        }
    } else {
        return function (type, listener, options) {
            queryData.nodes.forEach((node) => {
                node.addEventListener(type, listener, options)
            })
        }
    }
}
function wrapElement(element) {
    if (!element.id) {
        element.id = createId()
    }
    if (!elementCache[element.id]) {
        elementCache[element.id] = proxy(null, element, null, null)
    }
    return elementCache[element.id];
}

function proxy(parent, current, name, parentBindings) {
    var bindings = {};
    var data = {
        bindings: bindings,
        parentBindings: parentBindings,
        parent: parent,
        current: current,
        name: name
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
                if (typeof current[name] === 'object') return proxy(current, current[name], name, bindings);
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
        selector: selector,
        selectorSplit: selector.split(/[> ]/)
    }

    return new Proxy(object, {
        get: function (target, name) {
            if (name === 'length') return nodes.length;
            else if (typeof name === 'number' && object.nodes[name]) {
                return wrapElement(object.nodes[name]);
            }
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            if (queryMethods[name]) return queryMethods[name](object, refrence);
            else if (nodes.length === 1) return object.nodes[0][(refrence ? '$' : '') + name];
        },
        set: function (target, name, value) {

        }
    })
}
var AQuery = new Proxy(function (selector) {
    if (!selector) return;
    else if (typeof selector === 'string') {
        var elements = select(selector);
        return Query(elements, selector)
    } else if (typeof selector === 'object') {
        return wrapElement(selector);
    }
}, {
    get: function (target, name) {
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