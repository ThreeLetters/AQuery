function Query(nodes, selector) {
    var object = {
        nodes: nodes,
        wrappers: [],
        selector: selector,
        selectorSplit: selector.split(/[> ]/),
        listeners: []
    }
    nodes.forEach((node, i) => {
        object.wrappers[i] = wrapElement(node);
    })
    return new Proxy(object, {
        get: function (target, name) {
            if (name === 'length') return nodes.length;

            var refrence = false;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                refrence = true;
            }
            if (typeof name === 'number' && object.nodes[name]) {
                return refrence ? object.nodes[name] : object.wrappers[name];
            }
            if (queryMethods[name]) return queryMethods[name](object, refrence);
            else if (nodes.length === 1) return object.nodes[0][(refrence ? '$' : '') + name];
        },
        set: function (target, name, value) {

        }
    })
}
