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
            if (queryMethods[name]) toReturn = queryMethods[name](object, refrence, 'get', undefined, name);
            else if (nodes.length === 1) toReturn = object.nodes[0][(refrence ? '$' : '') + name];
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
            return chain ? proxyout : toReturn;
        }
    })
    return proxyout;
}
