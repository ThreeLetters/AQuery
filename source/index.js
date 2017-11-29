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
