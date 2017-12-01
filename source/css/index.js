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
    if (type === 'delete') {
        if (refrence) {
            if (cssRefrences[queryData.selector]) {
                Head.removeChild(cssRefrences[queryData.selector].element)
                cssRefrences[queryData.selector] = null;
                return true;
            }
            return false;
        } else {
            queryData.wrappers.map((wrap) => {
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
                return queryData.wrappers.map((wrap) => {
                    return css(wrap, property, value)
                });
            }, {
                deleteProperty: function (target, name) {
                    queryData.wrappers.map((wrap) => {
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
