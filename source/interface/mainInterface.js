function createMain() {
    return new Proxy(function (selector) {
        if (!selector) return;
        else if (typeof selector === 'string') {
            var elements = select(selector);
            return Query(elements, selector)
        } else if (typeof selector === 'object') {
            return wrapElement(selector);
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
            } else
            if (selectCache[name]) {
                return selectCache[name];
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
            }
        }
    });
}

function select(selector) {
    return Array.from(document.querySelectorAll(selector));
}
