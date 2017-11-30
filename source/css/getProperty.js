function getProperty(element, property) {
    property = getCssString(property);

    if (element.style[property]) return element.style[property];

    var styles = window.getComputedStyle(element);
    return styles.getPropertyValue(property);
}
