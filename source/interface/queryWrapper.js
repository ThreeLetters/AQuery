function Query(nodes, selector) {
    var object = {
        nodes: nodes.map((node) => {
            return wrapElement(node);
        }),
        selector: selector,
        selectorSplit: selector.split(/[> ]/),
        listeners: []
    }

    var chain = false;
    var chainResults = [];

    var proxyout = new Proxy(object.nodes, {
        get: function (target, name) {
            if (name === 'length') return object.nodes.length;
            else if (name === 'chain') {
                chainResults = [];
                chain = true;
                return proxyout;
            } else if (name === 'end') {
                chain = false;
                var result = chainResults[chainResults.length - 1]
                return new Proxy(result, {
                    get: function (target, name) {
                        if (name === 'results') return chainResults;
                        else return result[name];
                    }
                })
            }

            var toReturn = undefined;

            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }

            if (!isNaN(name) && object.nodes[name]) {
                toReturn = refrence ? object.nodes[name].elementData.current : object.nodes[name];
            } else
            if (queryMethods[name]) {
                if (queryMethods[name] === true) {
                    toReturn = function () {
                        var returnValue = object.nodes.map((node) => {
                            return node[(refrence ? '$' : '') + name].apply(node, arguments);
                        });
                        return chain ? proxyout : returnValue;
                    }
                } else {
                    toReturn = queryMethods[name](object, refrence, 'get', undefined, name);
                }

            } else if (object.nodes.length === 1) toReturn = object.nodes[0][(refrence ? '$' : '') + name];
            else {

                function proxyList(array) {
                    return new Proxy(array, {
                        get: function (target, name) {
                            if (!isNaN(name)) {
                                return array[name];
                            } else if (name === 'length') {
                                return array.length;
                            } else {
                                return proxyList(array.map((node) => {
                                    return node[name];
                                }))
                            }
                        },
                        set: function (target, name, value) {
                            return proxyList(array.map((node) => {
                                return node[name] = value;
                            }))
                        },
                        delete: function (target, name, value) {
                            return proxyList(array.map((node) => {
                                return delete node[name];
                            }))
                        }
                    })
                }
                toReturn = proxyList(object.nodes.map((node) => {
                    return node[(refrence ? '$' : '') + name];
                }));
            }
            return chain ? proxyout : toReturn;
        },
        set: function (target, name, value) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            var toReturn = undefined;
            if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'set', value, name);
            else if (object.nodes.length === 1) {
                toReturn = object.nodes[0][(refrence ? '$' : '') + name] = value;
            } else {
                toReturn = object.nodes.map((node) => {
                    return node[(refrence ? '$' : '') + name] = value;
                })
            }
            return chain ? proxyout : toReturn;
        },
        deleteProperty: function (target, name) {
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            var toReturn = undefined;
            if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'delete', undefined, name);
            else if (object.nodes.length === 1) {
                toReturn = delete object.nodes[0][(refrence ? '$' : '') + name];
            } else {
                toReturn = object.nodes.map((node) => {
                    return delete node[(refrence ? '$' : '') + name];
                })
            }
            return chain ? proxyout : toReturn;
        }
    })
    return proxyout;
}
