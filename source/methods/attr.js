 elementMethods.attr = function (elementData, refrence, type, value) {

     return new Proxy(function (name, value) {

         if (value !== undefined) {
             elementData.current.setAttribute(name, value)
             return value;
         } else {
             return elementData.current.getAttribute(name);
         }
     }, {
         deleteProperty: function (target, name) {
             elementData.current.removeAttribute(name);
             return true;
         }
     })

 }

 queryMethods.attr = true
