# AQuery - AntiJQuery

For those who want to program with the standard HTML DOM API yet want to make it fast.

## Purpose
While JQuery is very useful sometimes, it is quite a pain if you like using the standard JS API. However, the standard Javascript API is annoying as it makes programming take too long. AQuery solves this problem. It provides a JQuery like API (For people used to JQuery), while providing the normal Javascript API. So, you can use whatever you like.


For example:

```js
// This is JQuery syntax and it works on AQuery fine
$('.manyelements').css('display', 'inline-block');

// However, for AQuery, you can do this too.
$('.manyelements').style.display = "inline-block"

// Normal JS API (Takes too long)
var elements = document.body.getElementsByClassName(".manyelements");
for (var i = 0; i < elements.length; i++) {
    elements[i].style.display = "inline-block"
}

```


## Features:
* Allows for easy modification of the HTML DOM
* Group things togethor and do things togethor
* Includes the animation library Differential.JS - A very smooth and awesome tool
* Ajax queries like JQuery
* Refrences/Binding - Specify something once, and it will take effect
* Infinitly expandable API - Plugins are easy to add

## Usage

The usage is similar to JQuery:

> $(selector)

