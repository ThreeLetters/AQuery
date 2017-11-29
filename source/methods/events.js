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
