function proxy(parent, current, name) {
    var bindings = {};
    var data = {
        bindings: bindings,
        parent: parent,
        current: current,
        name: name,
        listeners: []
    }
    var type = typeof current;
    var iselement = type === 'object' && isElement(current);
    return new Proxy(current, {
        get: function (target, name) {
            if (name === 'elementData') {
                return data;
            } else
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    return elementMethods[name](data, true, 'get')
                } else {
                    if (!bindings[name]) bindings[name] = {
                        isRefrence: true,
                        owner: current,
                        attached: [],
                        name: name,
                        update: function (value) {
                            this.owner[this.name] = value;
                            this.attached.forEach((obj) => {
                                obj.current[this.name] = value;
                            });
                        }
                    };
                    return bindings[name];
                }
            } else if (iselement && elementMethods[name]) {
                return elementMethods[name](data, false, 'get')
            } else if (current[name]) {
                if (typeof current[name] === 'object') return proxy(current, current[name], name);
                else return current[name];
            }
        },
        set: function (target, name, value) {
            var refrence = false;
            if (name.charAt(0) === '$') name = name.substr(1), refrence = true;

            if (iselement && elementMethods[name]) {
                elementMethods[name](data, true, 'set', value)
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
            }
        },
        has: function (target, name) {

        },
        deleteProperty: function (target, name) {
            if (name.charAt(0) === '$') {
                name = name.substr(1);
                if (iselement && elementMethods[name]) {
                    elementMethods[name](data, true, 'delete')
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
                            bindings[name].attached[ind].pop();
                        }
                        bindings[name] = null;
                    }
                }
            } else if (iselement && elementMethods[name]) {
                elementMethods[name](data, false, 'delete')
            }
        }
    })
}
