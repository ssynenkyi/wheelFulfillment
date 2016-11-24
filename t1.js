  // foo.js
    // exports.f1 = function () {
    //   console.log('foo!');
    // }

    
var t2 = require('./t2.js');

// register event listener
t2.evnt.on("someEvent", function() {
    debugger;
    console.log('handle someEvent');
    // process data when someEvent occurs
});

t2.runInterval();