elementMethods.outerWidth = function (elementData, refrence, type) {
    if (type === 'get') {}
}

elementMethods.outerHeight = function (elementData, refrence, type) {
    if (type === 'get') {}
}

elementMethods.innerWidth = function (elementData, refrence, type) {
    if (type === 'get') {}
}

elementMethods.innerHeight = function (elementData, refrence, type) {
    if (type === 'get') {}
}

elementMethods.width = function (elementData, refrence, type) {
    if (type === 'get') {}
}
elementMethods.height = function (elementData, refrence, type) {
    if (type === 'get') {}
}


AQueryMethods.width = function (refrence, type) {
    if (type === 'get') {
        return Math.max(document.scrollHeight, document.offsetHeight, document.clientHeight)
    }
}
AQueryMethods.height = function (refrence, type) {
    if (type === 'get') {
        return Math.max(document.scrollWidth, document.offsetWidth, document.clientWidth)
    }
}
