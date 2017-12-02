queryMethods.forEach = queryMethods.each = function (queryData, refrence, type) {
    return function (call) {
        queryData.nodes.forEach(call);
    }
}

queryMethods.every = queryMethods.each = function (queryData, refrence, type) {
    return function (call) {
        return queryData.nodes.every(call);
    }
}

queryMethods.map = function (queryData, refrence, type) {
    return function (call) {
        var newArray = [];
        queryData.nodes.forEach((node, index) => {
            var results = call(node, index);

            if (results === false || results === undefined) return;
            newArray.push(isElement(results) ? results : node);
        });
        return Query(newArray, refrence ? queryData.selector : null);
    }
}
