function insertAfter(referenceNode, newNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(referenceNode, newNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

elementMethods.before = function (elementData) {
    return function (element) {
        return insertBefore(elementData.proxy, element);
    }
}
elementMethods.after = function (elementData) {
    return function (element) {
        return insertAfter(elementData.proxy, element);
    }
}
