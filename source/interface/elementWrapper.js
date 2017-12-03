function wrapElement(element) {
    if (element.elementData) return element;
    if (config.objectEdit) {
        if (!element.id) {
            element.id = createId()
        }
        if (!elementCache[element.id]) {
            elementCache[element.id] = proxy(null, element, null)
        }
        return elementCache[element.id];
    } else {
        var get = elementCache.get(element);

        if (!get) {
            get = proxy(null, element, null)
            elementCache.set(element, get)
        }
        return get;
    }
}
