function generateElementEvent(eventType) {
    return function (elementData, refrence, type) {
        if (type === 'delete') {
            elementData.listeners = elementData.listeners.filter((l) => {
                if (l.type === eventType) {
                    elementData.current.removeEventListener(l.type, l.listener)
                    return false;
                }
                return true;
            });
        } else {

            return new Proxy(function (listener, options) {
                if (!listener) {
                    elementData.current[eventType]();
                    return;
                }

                listener._listenerData = listener._listenerData || {
                    type: eventType,
                    listener: listener,
                    options: options
                }
                if (elementData.listeners.indexOf(listener._listenerData) === -1) {
                    elementData.current.addEventListener(eventType, listener, options)
                    elementData.listeners.push(listener._listenerData)
                }
            }, {
                get: function (target, name) {
                    var list = elementData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (name === 'length') {
                        return list.length;
                    } else
                    if (!isNaN(name)) {
                        return list[name].listener;
                    }
                },
                deleteProperty: function (target, name) {
                    var list = elementData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (!isNaN(name)) {
                        var l = list[name];
                        if (!l) return;
                        var ind = elementData.listeners.indexOf(l);
                        elementData.listeners.splice(ind, 1);
                        elementData.current.removeEventListener(eventType, l.listener)
                    }
                }
            })
        }
    }
}

function generateQueryEvent(eventType) {
    return function (queryData, refrence, type) {
        if (refrence && !queryData.selector) throw 'You cannot use refrence methods on a querylist with no selector.';
        if (type === 'delete') {
            queryData.listeners = queryData.listeners.filter((l) => {
                if (l.type === eventType) {
                    queryData.nodes.forEach((wrap) => {
                        var data = wrap.elementData;
                        var index = data.listeners.indexOf(listener);
                        if (index !== -1) {
                            data.listeners.splice(index, 1)
                            data.current.removeEventListener(listener.type, listener.listener)
                        }
                    });
                    return false;
                }
                return true;
            });
            return true;
        } else {
            return new Proxy(function (listener, options) {
                if (!listener) {

                    queryData.nodes.forEach((wrapper) => {
                        wrapper.elementData.current[eventType]();
                    })

                    return;
                }
                var listenerData = listener._listenerData = listener._listenerData || {
                    selector: queryData.selector,
                    type: eventType,
                    listener: listener,
                    options: options
                }
                if (queryData.listeners.indexOf(listenerData) === -1)
                    queryData.listeners.push(listenerData)
                queryData.nodes.forEach((node, i) => {
                    var data = node.elementData;
                    if (data.listeners.indexOf(listenerData) !== -1) return;
                    data.current.addEventListener(eventType, listener, options)
                    data.listeners.push(listenerData)
                });
                if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
            }, {
                get: function (target, name) {
                    var list = queryData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (name === 'length') {
                        return list.listeners.length;
                    } else
                    if (!isNaN(name)) {
                        return list.listeners[name].listener;
                    }
                },
                deleteProperty: function (target, name) {
                    var list = queryData.listeners.filter((l) => {
                        return l.type === eventType
                    })
                    if (!isNaN(name)) {
                        var l = list[name];
                        if (!l) return;
                        var ind = queryData.listeners.indexOf(l);
                        queryData.listeners.splice(ind, 1);
                        if (l.isRefrenceEvent) {
                            var ind = refrenceListeners.indexOf(l);
                            refrenceListeners.splice(ind, 1);
                            l.isRefrenceEvent = false;
                        }
                        queryData.nodes.forEach((wrap) => {
                            var data = wrap.elementData;
                            var index = data.listeners.indexOf(l);
                            if (index !== -1) {
                                data.current.removeEventListener(l.type, l.listener)
                                data.listeners.splice(index, 1)
                            }
                        })
                    }
                }
            })
        }
    }
}



customEvents.forEach((event) => {
    elementMethods[event] = generateElementEvent(event)
    queryMethods[event] = generateQueryEvent(event)

});
