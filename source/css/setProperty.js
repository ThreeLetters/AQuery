function setProperty(element, property, value) {
    property = getCssString(property);


    if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
        var value2 = parseFloat(value);
        var newValue = value2;
        var originalValueRaw = getProperty(element, property);
        var originalValue = parseFloat(originalValueRaw)
        var operator = value.charAt(0);
        var isFound = true;

        value2 = parseFloat(value.substr(2));

        switch (operator) {
            case '+':
                newValue = originalValue + value2;
                break;
            case '-':
                newValue = originalValue - value2;
                break;
            case '*':
                newValue = originalValue * value2;
                break;
            case '/':
                newValue = originalValue / value2;
                break;
            case '^':
                newValue = Math.pow(originalValue, value2);
                break;
            default:
                isFound = false;
                break;
        }
        if (isFound) {
            var ending = value.substr(value2.toString().length + 2);
            if (!ending) {
                ending = originalValueRaw.substr(originalValue.toString().length);
            }
            value = newValue + ending
        }
    }


    return element.style[property] = value;
}

function setPropertyRefrence(queryData, property, value) {
    if (!cssRefrences[queryData.selector]) {
        var newStyleElement = document.createElement('div');
        newStyleElement.innerHTML = '<br><style>' + queryData.selector + ' {}</style>'
        Head.appendChild(newStyleElement);
        cssRefrences[queryData.selector] = {
            element: newStyleElement,
            style: {},
            selector: queryData.selector
        }
    }
    var styleElement = cssRefrences[queryData.selector];
    property = getCssString(property);
    var value2 = parseFloat(value);
    var newValue = value2;
    var originalValueRaw = styleElement.style[property];
    var originalValue = parseFloat(originalValueRaw)
    if (typeof value === 'string' && value.length > 2 && value.charAt(1) === '=') {
        var operator = value.charAt(0);
        var isFound = true;

        value2 = parseFloat(value.substr(2));

        switch (operator) {
            case '+':
                newValue = originalValue + value2;
                break;
            case '-':
                newValue = originalValue - value2;
                break;
            case '*':
                newValue = originalValue * value2;
                break;
            case '/':
                newValue = originalValue / value2;
                break;
            case '^':
                newValue = Math.pow(originalValue, value2);
                break;
            default:
                isFound = false;
                break;
        }
        if (isFound) {
            value = value.substr(2);
        }
    }

    var ending = value.substr(value2.toString().length);
    if (!ending) {
        ending = originalValueRaw.substr(originalValue.toString().length);
    }

    styleElement.style[property] = newValue + ending;
    updateCSSRefrence(styleElement);
    return styleElement.style[property];
}
