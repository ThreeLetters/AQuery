function proxy(parent, current, name) {
    var bindings = {};
    var cache = {};
    var data = {
        bindings: bindings,
        parent: parent,
        current: current,
        name: name,
        listeners: []
    }
    var type = typeof current;
    var iselement = type === 'object' && isElement(current);

    var chain = false,
        chainResults = [];

    var proxyOut = new Proxy(current, {
        get: function (target, name) {
            var toReturn = undefined;
            if (name === 'elementData') {
                return data;
            } else if (name === 'chain') {
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
                });
            } else if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, true, 'get', undefined, name)
                } else {
                    if (!bindings[name]) bindings[name] = {
                        isRefrence: true,
                        owner: current,
                        attached: [],
                        name: name,
                        update: function (value) {
                            this.owner[this.name] = value;
                            this.attached.forEach((obj) => {
                                for (var name in obj.bindings) {
                                    if (obj.bindings[name] === this) obj.current[name] = value;
                                }
                            });
                        }
                    };
                    toReturn = bindings[name];
                }
            } else if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, false, 'get', undefined, name)
            } else if (current[name]) {
                if (typeof current[name] === 'object') {
                    if (!cache[name] || cache[name].elementData.current !== current[name]) {
                        cache[name] = isElement(current[name]) ? wrapElement(current[name]) : proxy(current, current[name], name);
                    }
                    toReturn = cache[name];
                } else toReturn = current[name];
            }
            return chain ? proxyOut : toReturn
        },
        set: function (target, name, value) {
            var refrence = false;
            var toReturn = undefined;
            if (name.charAt(0) === '$') name = name.substr(1), refrence = true;

            if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, true, 'set', value, name)
            } else {
                if (value && value.isRefrence) {
                    if (bindings[name] !== value) {
                        if (bindings[name]) {
                            var ind = bindings[name].attached.indexOf(data);
                            bindings[name].attached[ind] = bindings[name].attached[bindings[name].attached.length - 1]
                            bindings[name].attached[ind].pop();
                        }
                        value.attached.push(data);
                        current[name] = value.owner[value.name]
                        bindings[name] = value;
                    }
                } else {
                    if (bindings[name]) {
                        bindings[name].update(value)
                    } else {
                        current[name] = value;
                    }
                }
                toReturn = current[name];
            }
            return chain ? proxyOut : toReturn
        },
        deleteProperty: function (target, name) {
            var toReturn = undefined;
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    toReturn = elementMethods[name](data, true, 'delete', undefined, name)
                } else {
                    if (bindings[name]) {
                        if (bindings[name].owner === current) {
                            bindings[name].attached.forEach((att) => {
                                att.bindings[name] = null;
                            })
                            bindings[name].attached = null;
                        } else {
                            var ind = bindings[name].attached.indexOf(data);
                            bindings[name].attached[ind] = bindings[name].attached[bindings[name].attached.length - 1]
                            bindings[name].attached.pop();
                        }
                        bindings[name] = null;
                        toReturn = true;
                    } else toReturn = false;
                }
            } else if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, false, 'delete', undefined, name)
            }
            return chain ? proxyOut : toReturn
        }
    })
    data.proxy = proxyOut;
    return proxyOut;
}
