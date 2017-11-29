function show(elementData) {
    if (elementData.current.style.display === 'none') elementData.current.style.display = elementData.defaultDisplay || '';
}

function hide(elementData) {
    if (elementData.current.style.display !== 'none') {
        elementData.defaultDisplay = elementData.current.style.display
        elementData.current.style.display = 'none'
    }
}

function toggle(elementData, override) {
    if ((elementData.current.style.display === 'none' || override === true) && override !== false) {
        show(elementData);
    } else {
        hide(elementData);
    }
}

elementMethods.show = function (elementData) {
    return function () {
        show(elementData)
    }
}
elementMethods.hide = function (elementData) {
    return function () {
        hide(elementData)
    }
}
elementMethods.toggle = function (elementData) {
    return function (override) {
        show(elementData, override)
    }
}

queryMethods.show = function (queryData) {
    return function () {
        queryData.hideState = false;
        queryData.wrappers.forEach((wrapper) => {
            show(wrapper.elementData)
        })
    }
}
queryMethods.hide = function (queryData) {
    return function () {
        queryData.hideState = true;
        queryData.wrappers.forEach((wrapper) => {
            hide(wrapper.elementData)
        })
    }
}
queryMethods.toggle = function (queryData) {
    return function (override) {
        if ((queryData.hideState || override === true) && override !== false) {
            queryData.hideState = false;
        } else {
            queryData.hideState = true;
        }
        queryData.wrappers.forEach((wrapper) => {
            if (queryData.hideState) {
                hide(wrapper.elementData)
            } else {
                show(wrapper.elementData)
            }
        });
    }
}
