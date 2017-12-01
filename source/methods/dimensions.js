['width', 'height'].forEach((dimension, dim) => {
    ['', 'inner', 'outer', 'whole'].forEach((extra, type) => {
        var dimensionStr = dimension;
        if (extra) dimensionStr = dimension.charAt(0).toUpperCase() + dimension.substr(1);
        var str = extra + dimensionStr;
        elementMethods[str] = function (elementData, refrence, actiontype, setvalue) {
            var offset = 0;
            if (type) {
                offset += parseFloat(css(elementData.proxy, dim ? 'padding-top' : 'padding-left'));
                offset += parseFloat(css(elementData.proxy, dim ? 'padding-bottom' : 'padding-right'));
                if (type >= 2) {
                    offset += parseFloat(css(elementData.proxy, dim ? 'border-top-width' : 'border-left-width'));
                    offset += parseFloat(css(elementData.proxy, dim ? 'border-bottom-width' : 'border-right-width'));
                    if (type === 3) {
                        offset += parseFloat(css(elementData.proxy, dim ? 'margin-top' : 'margin-left'));
                        offset += parseFloat(css(elementData.proxy, dim ? 'margin-bottom' : 'margin-right'));
                    }
                }
            }
            if (setvalue && type) {
                setvalue = parseFloat(setvalue) - offset;
            }
            var value = parseFloat(css(elementData.proxy, dimension, setvalue));
            return value + offset;
        }
    });
})



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
