elementMethods.append = elementMethods.appendChild = function (elementData, refrence) {

    return function (child) {
        if (child.elementData) {
            child = child.elementData.current;
        }
        refrenceListeners.forEach((listener) => {
            if (child.matches(listener.selector)) {
                child.addEventListener(listener.type, listener.listener, listener.options)
            }
        })
        elementData.current.appendChild(child);
    }

}
