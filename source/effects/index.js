elementMethods.fadeIn = function (elementData) {
    return function (duration, complete, ending) {
        var options = {
            duration: duration,
            done: complete,
            queue: false
        }
        D(elementData.proxy, {
            opacity: 1,
            display: ending || 'block'
        }, options);
    }
}

elementMethods.fadeOut = function (elementData) {
    return function (duration, complete) {

        var options = {
            duration: duration,
            done: complete,
            queue: false
        }
        D(elementData.proxy, [{
            opacity: 0
        }, {
            display: 'none'
        }], options);
    }
}
elementMethods.D = elementMethods.animate = function (elementData) {
    return function (properties, options, options2, callback) {
        return D(elementData.proxy, properties, options, options2, callback)
    }
}
