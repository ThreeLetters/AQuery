var shortcuts = {
    text: 'textContent',
    html: 'innerHTML',
    val: 'value'
}

for (var to in shortcuts) {
    (function (to, from) {
        elementMethods[to] = function (elementData, refrence, type, value) {
            if (type === 'get') {
                return elementData.current[from];
            } else if (type === 'set') {
                return elementData.current[from] = value;
            } else if (type === 'delete') {
                return delete elementData.current[from];
            }
        }
    })(to, shortcuts[to])
}
