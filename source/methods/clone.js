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
