elementMethods.fadeIn = function (elementData) {
    return function (duration, complete, ending) {
        var options = {
            duration: duration,
            done: complete,
            queue: false
        }
        elementData.current.D({
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
        elementData.current.D([{
            opacity: 0
        }, {
            display: 'none'
        }], options);
    }
}
