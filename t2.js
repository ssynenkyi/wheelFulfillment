
// app.js
//    var t1 = require('./t1.js');
//     t1.f1();
var EventEmitter = require('events').EventEmitter;

var obj = new EventEmitter();

// export the EventEmitter object so others can use it
exports.evnt = obj;

// other code in the module that does something to trigger events
// this is just one example using a timer
exports.runInterval = function () {
    setInterval(function () {
        debugger;
        console.log('emit someEvent')
        obj.emit("someEvent");
    }, 10 * 1000);
}

