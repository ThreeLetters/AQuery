var config = {
    objectEdit: true

}

var elementMethods = {},
    queryMethods = {},
    AQueryMethods = {},
    elementCache = config.objectEdit ? {} : new Map(),
    refrenceListeners = [],
    nodeId = 0,
    AQuery,
    Head = {
        nodes: [],
        appendChild: function (node) {
            this.nodes.push(node)
        },
        removeChild: function (node) {
            var ind = this.nodes.indexOf(node);
            if (ind !== -1) this.node.splice(ind, 1)
        }
    },
    cssRefrences = {};

var customEvents = ['blur', 'focus', 'keydown', 'keyup', 'keypress', 'resize', 'scroll', 'select', 'submit', 'click', 'dblclick', 'change', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'contextmenu'];


window.addEventListener('load', function () {
    var head = document.head || document.getElementsByTagName("head")[0];
    Head.nodes.forEach((node) => {
        head.appendChild(node);
    })
    Head = head;
})

function createId() {
    return 'aquery_id_' + nodeId++;
}

function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// only implement if no native implementation is available
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};
