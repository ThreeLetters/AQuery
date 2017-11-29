var files = [
    'init.js',
    'methods/*.js',
    'interface/proxyObject.js',
    'interface/elementWrapper.js',
    'interface/queryWrapper.js',
    'interface/mainInterface.js',
    'index.js',
];

function Glob(files) {
    var fs = require('fs')

    function regexIndexOf(string, regex, startpos) {
        var indexOf = string.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    function regexLastIndexOf(string, regex, startpos) {
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
        if (typeof (startpos) == "undefined") {
            startpos = string.length;
        } else if (startpos < 0) {
            startpos = 0;
        }
        var stringToWorkWith = string.substring(0, startpos + 1);
        var lastIndexOf = -1;
        var nextStop = 0;
        while ((result = regex.exec(stringToWorkWith)) != null) {
            lastIndexOf = result.index;
            regex.lastIndex = ++nextStop;
        }
        return lastIndexOf;
    }
    var out = [];

    function get(file) {
        if (/[*?\[\]]/.test(file)) {
            var ind = regexIndexOf(file, /[*?\[\]]/),
                ind2 = file.lastIndexOf('/', ind);

            var before = file.substring(0, ind2),
                after = file.substring(ind2 + 1)
            try {
                fs.statSync(before);
                after = after.split('/');

                function walk(path, i) {
                    try {
                        var current = fs.readdirSync(path);
                        var rule = after[i];
                        if (/[*?\[\]]/.test(rule)) {
                            var regex = new RegExp(rule.replace(/[*?]/g, function (a) {
                                return '.' + (a === '*' ? '*' : '')
                            }));
                            current.forEach((p) => {
                                if (regex.test(p)) {
                                    if (i === after.length - 1) {
                                        out.push(path + '/' + p);
                                    } else {
                                        walk(path + '/' + p, i + 1)
                                    }
                                }
                            });
                        } else {

                            if (current.indexOf(rule) !== -1) {
                                if (i === after.length - 1) {
                                    out.push(path + '/' + rule);
                                } else {
                                    walk(path + '/' + rule, i + 1)
                                }
                            }
                        }
                    } catch (e) {

                    }
                }
                walk(before, 0)
            } catch (e) {

            }
        } else {
            if (fs.existsSync(file)) {
                out.push(file);
            }
        }
    }
    if (typeof files === 'object') {
        files.forEach((file) => {
            get(file)
        })
    } else {
        get(files)
    }
    return out;
}
var http = require("http"),
    https = require("https"),
    querystring = require("querystring");
var request = function (f, b, c, d) {
    var e = !1,
        h = !1;
    if (c) {
        e = querystring.stringify(b);
        var g = c;
        h = d
    } else g = b, h = c;
    d = !1;
    b = "/";
    var m = "";
    c = "";
    var a = f.split("://");
    d = "https" == a[0] ? !0 : !1;
    a = a[1] ? a.slice(1).join("://") : a[0];
    a = a.split("/");
    var k = a[0].split(":");
    f = k[0];
    k[1] && (c = parseInt(k[1]));
    a[1] && (b += a.slice(1).join("/"));
    d = d ? https : http;
    h && (b += "?" + Date.now());
    try {
        var n = e ? {
                host: f,
                path: b,
                port: c,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(e)
                }
            } : {
                host: f,
                path: b,
                port: c
            },
            l = d.request(n, function (a) {
                a.setEncoding("utf8");
                a.on("data", function (a) {
                    m += a
                });
                a.on("end", function () {
                    g(!1, a, m)
                })
            });
        l.on("error", function (a) {
            g(a, null, null)
        });
        e && l.write(e);
        l.end()
    } catch (p) {
        g(p, null, null)
    }
};

function compile(code, callback) {

    request('https://closure-compiler.appspot.com/compile', {
        "js_code": code,
        "compilation_level": "SIMPLE_OPTIMIZATIONS",
        "output_format": "text",
        "output_info": "compiled_code"
    }, function (e, r, b) {
        callback(b)
    })
}


var fs = require('fs');

files = Glob(files.map((f) => {
    return __dirname + '/source/' + f;
})).filter((v, i, a) => a.indexOf(v) === i).map((file) => {
    return '// ' + file.replace(__dirname + '/source/', '') + '\n' + fs.readFileSync(file, 'utf8');
});

var out = '(function (window) {\n' + files.join('') + '})(window)';

var version = "0.0.1";
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!

var yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}
var date = dd + '/' + mm + '/' + yyyy;

var top = `\
/*\n\
 Aquery: The world's best DOM wrapper\n\
\n\
 Author: Andrews54757 & LegitSoulja\n\
 License: MIT (https://github.com/ThreeLetters/AQuery/blob/master/LICENSE)\n\
 Source: https://github.com/ThreeLetters/AQuery\n\
 Build: v${version}\n\
 Built on: ${date}\n\
*/\n\n`;


fs.writeFileSync(__dirname + '/dist/AQuery.js', top + out)


compile(out, function (compiled) {
    fs.writeFileSync(__dirname + '/dist/AQuery.min.js', top + compiled)
    console.log("Compiled " + files.length + " files")
})
