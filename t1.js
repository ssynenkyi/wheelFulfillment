  // foo.js
    // exports.f1 = function () {
    //   console.log('foo!');
    // }

    
var t2 = require('./t2.js');


for(var i = 0; i < 10; i++){
    t2.Lincks.push('l' + i);
    //console.log('l' + i);
       // console.log(t2.Lincks);
}

console.log(t2.Lincks);
// register event listener
// t2.evnt.on("someEvent", function() {
//     debugger;
//     console.log('handle someEvent');
//     // process data when someEvent occurs
// });

// t2.runInterval();

