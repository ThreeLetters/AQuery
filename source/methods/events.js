elementMethods.on = elementMethods.addEventListener = function (elementData, refrence, type) {
    if (type === 'delete') {
        elementData.listeners.forEach((listener) => {
            elementData.current.removeEventListener(listener.type, listener.listener)
        })
        elementData.listeners = [];
    } else {

        return new Proxy(function (type, listener, options) {
            if (!listener) {
                elementData.listeners.forEach((listener) => {
                    if (listener.type === type) {
                        listener.listener.apply(elementData.current, []);
                    }
                })
                return;
            }
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
                                l = l._listenerData
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
}

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence, type) {
    if (type === 'delete') {
        queryData.listeners.forEach((listener) => {
            queryData.wrappers.forEach((wrap) => {
                var data = wrap.elementData;
                var index = data.listeners.indexOf(listener);
                if (index !== -1) {
                    data.listeners.splice(index, 1)
                    data.current.removeEventListener(listener.type, listener.listener)
                }
            })
        })
        queryData.listeners = [];
    } else {
        return new Proxy(function (type, listener, options) {
            if (!listener) {
                queryData.listeners.forEach((listener) => {
                    if (listener.type === type) {
                        queryData.wrappers.forEach((wrapper) => {
                            if (wrapper.elementData.listeners.indexOf(listener) !== -1)
                                listener.listener.apply(wrapper.elementData.current, []);
                        })
                    }
                })
                return;
            }
            var listenerData = listener._listenerData = listener._listenerData || {
                selector: queryData.selector,
                type: type,
                listener: listener,
                options: options
            }
            if (queryData.listeners.indexOf(listenerData) === -1)
                queryData.listeners.push(listenerData)
            queryData.nodes.forEach((node, i) => {
                var data = queryData.wrappers[i].elementData;
                if (data.listeners.indexOf(listenerData) !== -1) return;
                node.addEventListener(type, listener, options)
                data.listeners.push(listenerData)
            });
            if (refrence && !listenerData.isRefrenceEvent) refrenceListeners.push(listenerData), listenerData.isRefrenceEvent = true;
        }, {
            get: function (target, name) {
                if (name === 'length') {
                    return queryData.listeners.length;
                } else
                if (typeof name === 'number') {
                    return queryData.listeners[name].listener;
                } else {
                    var newList = []
                    queryData.listeners.forEach((l) => {
                        if (l.type === name) {
                            newList.push(l.listener);
                        }
                    })
                    return new Proxy(newList, {
                        deleteProperty: function (target, name) {
                            if (typeof name === 'number') {
                                var l = newList[name];
                                if (!l) return;
                                l = l._listenerData
                                newList.splice(name, 1);
                                var ind = queryData.listeners.indexOf(l);
                                if (l !== -1) queryData.listeners.splice(ind, 1);
                                if (l.isRefrenceEvent) {
                                    var ind = refrenceListeners.indexOf(l);
                                    refrenceListeners.splice(ind, 1);
                                    l.isRefrenceEvent = false;
                                }
                                queryData.wrappers.forEach((wrap) => {
                                    var data = wrap.elementData;
                                    var index = data.listeners.indexOf(l);
                                    if (index !== -1) {
                                        data.current.removeEventListener(l.type, l.listener)
                                        data.listeners.splice(index, 1)
                                    }
                                })
                            }
                        }
                    });
                }
            },
            deleteProperty: function (target, name) {
                if (typeof name === 'number') {
                    var l = queryData.listeners[name];
                    if (!l) return;
                    queryData.listeners.splice(name, 1);
                    if (l.isRefrenceEvent) {
                        var ind = refrenceListeners.indexOf(l);
                        refrenceListeners.splice(ind, 1);
                        l.isRefrenceEvent = false;
                    }
                    queryData.wrappers.forEach((wrap) => {
                        var data = wrap.elementData;
                        var index = data.listeners.indexOf(l);
                        if (index !== -1) {
                            data.current.removeEventListener(l.type, l.listener)
                            data.listeners.splice(index, 1)
                        }
                    })
                } else {
                    queryData.listeners = queryData.listeners.filter((l) => {
                        if (l.type === name) {
                            if (l.isRefrenceEvent) {
                                var ind = refrenceListeners.indexOf(l);
                                refrenceListeners.splice(ind, 1);
                                l.isRefrenceEvent = false;
                            }
                            elementData.current.removeEventListener(l.type, l.listener)
                            queryData.wrappers.forEach((wrap) => {
                                var data = wrap.elementData;
                                var index = data.listeners.indexOf(l);
                                if (index !== -1) {
                                    data.current.removeEventListener(l.type, l.listener)
                                    data.listeners.splice(index, 1)
                                }
                            })
                            return false;
                        }
                        return true;
                    })
                }
            }
        })
    }
}
