function wrapElement(element) {
    if (element.elementData) return element;
    if (!element.id) {
        element.id = createId()
    }
    if (!elementCache[element.id]) {
        elementCache[element.id] = proxy(null, element, null)
    }
    return elementCache[element.id];
}
