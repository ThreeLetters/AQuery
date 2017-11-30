function css(element, property, value) {

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
        return value ? setProperty(element, property, value) : getProperty(element, property)
    }

}

function getCssString(name) {

    name.split('-');
    return name.map((n, i) => {
        if (i !== 0) return capitalizeFirstLetter(n);
        return n;
    }).join('');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


elementMethods.css = function (elementData) {
    return function (property, value) {
        return css(elementData.proxy, property, value)
    }
}
queryMethods.css = function (queryData) {
    return function (property, value) {
        return queryData.wrappers.map((wrap) => {
            return css(wrap, property, value)
        })
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
