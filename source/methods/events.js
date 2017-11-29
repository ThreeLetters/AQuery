elementMethods.on = elementMethods.addEventListener = function (elementData, refrence) {

    return function (type, listener, options) {
        elementData.current.addEventListener(type, listener, options)
    }

}

queryMethods.on = queryMethods.addEventListener = function (queryData, refrence) {
    if (refrence) {
        return function (type, listener, options) {
            queryData.nodes.forEach((node) => {
                node.addEventListener(type, listener, options)
            });
            refrenceListeners.push({
                selector: queryData.selector,
                type: type,
                listener: listener,
                options: options
            })
        }
    } else {
        return function (type, listener, options) {
            queryData.nodes.forEach((node) => {
                node.addEventListener(type, listener, options)
            })
        }
    }
}
