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

    function createBinding(reversable, name, unit) {
        return {
            isRefrence: true,
            isReversable: true,
            object: current,
            name: name,
            unit: unit,
            depends: [],
            influences: [],
            value: 0,
            offset: 0,
            calculate: function () {
                this.value = this.offset;
                this.depends.forEach((d) => {
                    var value = d[0].value;
                    if (convertUnits && this.unit && d[0].unit && this.unit !== d[0].unit) {
                        value = convertUnits(document.body, value, d[0].unit, this.unit);
                    }

                    this.value += value * d[1];
                });
                this.changed(true);
            },
            changed: function (dontReverse, caller) {
                this.object[this.name] = this.value + this.unit;
                this.influences.forEach((o) => {
                    if (o !== caller) o.calculate();
                });

                if (!dontReverse && this.depends.length) {
                    if (this.isReversable) {
                        var val = (this.value - this.offset) / this.depends[0][1];
                        this.depends.forEach((d) => {
                            if (convertUnits && this.unit && d[0].unit && this.unit !== d[0].unit) {
                                val = convertUnits(document.body, val, this.unit, d[0].unit);
                            }
                            d[0].value = val;
                            d[0].changed(false, this);
                        })
                    } else {
                        throw "ERROR: Cannot set bound property which is not reversable! At property " + this.name
                    }
                }
            },
            removeBinding: function () {
                this.depends.forEach((d) => {
                    d[0].influences.splice(d[0].influences.indexOf(this), 1)
                });
                this.depends = [];
                this.offset = 0;
            }
        };
    }

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

                    if (!bindings[name]) {
                        var unit = "";
                        var number = 0;
                        if (typeof current[name] === "string") {
                            var match = current[name].match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/)
                            if (match[1]) {
                                number = parseFloat(match[1]);
                                unit = match[2];
                            }
                        } else number = parseFloat(current[name])

                        bindings[name] = createBinding(true, name, unit)
                        bindings[name].value = number;
                    }
                    toReturn = magicNumbers.getMagicNumber(bindings[name])
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
                if (refrence && value) {
                    var number, unit;
                    if (typeof value == "string") {
                        var match = value.toString().match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/)
                        number = parseInt(match[1]);
                        unit = match[2];
                    } else if (typeof value == "number") {
                        number = value;
                    } else {
                        throw "ERROR: Refrences must point to another one";
                    }
                    var objects = magicNumbers.numberToObjects(number);

                    if (!unit) {
                        unit = objects.objects[0][0].unit;
                        console.log("WARNING: Unit was not defined for property " + name + ". Unit was assumed to be " + unit)
                    }
                    if (!bindings[name]) {
                        bindings[name] = createBinding(false, name, unit)
                    }
                    bindings[name].removeBinding();
                    bindings[name].unit = unit;
                    bindings[name].isReversable = objects.objects.length <= 1
                    bindings[name].depends = objects.objects;
                    objects.objects.forEach((o) => {
                        o[0].influences.push(bindings[name])
                    })
                    bindings[name].offset = objects.offset;
                    bindings[name].calculate();
                } else {
                    if (bindings[name]) {


                        var match = value.toString().match(/^(\-?[0-9\.]*)(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|s|ms|deg|grad|rad|turn|Q)?$/)
                        var number = parseFloat(match[1]);
                        var unit = match[2];
                        if (unit) bindings[name].unit = unit;
                        bindings[name].value = number;
                        bindings[name].changed()
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
                    if (bindings[name] && bindings[name].depends.length) {
                        bindings[name].removeBinding();
                    } else if (data.name === 'style') current[name] = '', toReturn = true;
                    else toReturn = delete current[name];
                }
            } else if (iselement && elementMethods[name]) {
                toReturn = elementMethods[name](data, false, 'delete', undefined, name)
            } else {
                if (data.name === 'style') current[name] = '', toReturn = true;
                else toReturn = delete current[name];
            }
            return chain ? proxyOut : toReturn
        }
    });
    data.proxy = proxyOut;
    return proxyOut;
}
