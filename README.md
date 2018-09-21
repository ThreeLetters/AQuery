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

## Bindings/Refrences

Bindings and refrences makes your life easier. If you want to have a property of one object depend on another, use this to make sure you only do it once. It can even do calculated values!

```js
// Normal syntax, set the width of one element to 2/3 the parent element
$("#something").style.width = $("#parent").style.width * 2/3;

// Change the parent's size
$("#parent").style.width = "100px"

// Recalculate since it changed
$("#something").style.width = $("#parent").style.width * 2/3;

// OR, special syntax using refrences/bindings. Note the unit. Unit conversions are automatically done.
$("#something").style.$width = $("#parent").style.$width * 2/3 + "px";

// Change the parent's size
$("#parent").style.width = "100px"

// Dont have to do anything. The #something element's width will automatically re-calculate

// NOTE: This works with all coefficients between -10 and 10 inclusive for up to 3 unknowns. In addition, you can add an "offset" d
// The coefficients can also be fractions: a/b, where A and B are between -10 and 10 inclusive
// result = ax + by + cz + d
// where -10 <= a,b,c <= 10
```

## Usage

The usage is similar to JQuery:

> $(selector)

