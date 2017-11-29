AQuery = createMain();
window.AQuery = AQuery
if (!window.$) {
    window.$ = window.AQuery;
}
