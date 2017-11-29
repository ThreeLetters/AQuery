elementMethods.on = elementMethods.addEventListener = function (elementData, refrence) {

    return new Proxy(function (type, listener, options) {
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
            if (typeof name === 'number') {
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
                        if (typeof name === 'number') {
                            var l = newList[name];
                            if (!l) return;
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
            if (typeof name === 'number') {
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

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence) {

    return new Proxy(function (type, listener, options) {
        var listenerData = listener._listenerData = listener._listenerData || {
            selector: queryData.selector,
            type: type,
            listener: listener,
            options: options
        }
        if (queryData.listeners.indexOf(listenerData) === -1)
            queryData.listeners.push(listenerData)
        queryData.nodes.forEach((node, i) => {
            if (queryData.wrappers[i].listeners.indexOf(listenerData) !== -1) return;
            node.addEventListener(type, listener, options)
            queryData.wrappers[i].listeners.push(listenerData)
        });
        if (refrence && refrenceListeners.indexOf(listenerData) === -1) refrenceListeners.push(listenerData);
    }, {
        get: function (target, name) {
            if (name === 'length') {
                return queryData.listeners.length;
            } else
            if (typeof name === 'number') {
                return queryData.listeners[name].listener;
            }
        }
    })
}
