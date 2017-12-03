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
                toReturn = queryMethods[name](object, refrence, 'get', undefined, name);
            } else if (object.nodes.length === 1) toReturn = object.nodes[0][(refrence ? '$' : '') + name];
            else {

                function proxyList(array, parent, parname, func) {
                    return new Proxy(func || array, {
                        get: function (target, name) {
                            if (!isNaN(name)) {
                                return array[name];
                            } else if (name === 'length') {
                                return array.length;
                            } else if (name === 'listData') {
                                return array;
                            } else if (name === 'link') {
                                return function () {
                                    var initial = false;
                                    parname = parname.charAt(0) === '$' ? parname.substr(1) : parname;
                                    parent.forEach((node) => {
                                        if (!initial) initial = node['$' + parname];
                                        else node[parname] = initial;
                                    })
                                    return initial;
                                }
                            } else {
                                return proxyList(array.map((node) => {
                                    return node[name];
                                }), array, name, function () {
                                    return array.map((node) => {
                                        return node[name].apply(node, arguments)
                                    });
                                })
                            }
                        },
                        set: function (target, name, value) {
                            if (value.listData) {
                                var data = value.listData;
                                if (data.length === array.length) {
                                    return proxyList(array.map((node, i) => {
                                        return node[name] = data[i];
                                    }), array, name)
                                } else {
                                    return proxyList(array.map((node, i) => {
                                        return node[name] = data[0];
                                    }), array, name)
                                }
                            }
                            return proxyList(array.map((node) => {
                                return node[name] = value;
                            }), array, name)
                        },
                        deleteProperty: function (target, name, value) {
                            return proxyList(array.map((node) => {
                                return delete node[name];
                            }), array, name);
                        }
                    })
                }
                toReturn = proxyList(object.nodes.map((node) => {
                    return node[(refrence ? '$' : '') + name];
                }), object.nodes, (refrence ? '$' : '') + name, function () {
                    return object.nodes.map((node) => {
                        return node[(refrence ? '$' : '') + name].apply(node, arguments);
                    });
                });
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
