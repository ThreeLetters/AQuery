function Query(nodes, selector) {
    var object = {
        nodes: nodes,
        wrapperCache: [],
        selector: selector
    }

    return new Proxy(object, {
        get: function (target, name) {
            if (name === 'length') return nodes.length;
            else if (typeof name === 'number' && object.nodes[name]) {
                if (!object.wrapperCache[name])
                    object.wrapperCache[name] = proxy(null, object.nodes[name], null, null)
                return object.wrapperCache[name];
            }
            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            if (queryMethods[name]) return queryMethods[name](object, refrence);
            else if (nodes.length === 1) return object.nodes[0][(refrence ? '$' : '') + name];
        },
        set: function (target, name, value) {

        }
    })
}
