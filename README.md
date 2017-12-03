# AQuery
The most flexible, efficient, and easy javascript DOM wrapper. Its Jquery times 1000.

## Usage

> $(selector)

## Documentation

```js
var elements = $('.classname')

elements.style.width = elements.style.$height // bind two togethor

elements.style.width = '30px' // will also change height

elements[0].height = '10px' // will only change the width and height of first element

delete elements.style.$height; // remove binding, reset

```