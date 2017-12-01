function getProperty(element, property) {
    property = getCssString(property);

    if (element.style[property]) return element.style[property];

    var styles = window.getComputedStyle(element);
    return styles.getPropertyValue(getPropertyString(property));
}

function getPropertyString(property) {
    return property.replace(/[A-Z]/g, function (a) {
        return '-' + a.toLowerCase();
    });
}
