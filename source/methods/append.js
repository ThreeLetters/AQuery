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
