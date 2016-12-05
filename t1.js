// foo.js
// exports.f1 = function () {
//   console.log('foo!');
// }


// var t2 = require('./t2.js');


// var testObject = [
//   {
//     category: 'http://www.1800wheelchair.com/category/752/bath-lifts/',
//     products: [
//       "http://www.1800wheelchair.com/product/bellavita-auto-bath-lift/",
//       "http://www.1800wheelchair.com/product/splash-bath-lift/",
//       "http://www.1800wheelchair.com/product/drive-aquajoy-premier-plus-reclining-bathlift/",
//       "http://www.1800wheelchair.com/product/drive-bellavita-hand-control-including-storage-battery/",
//       "http://www.1800wheelchair.com/product/side-flap-for-drive-bellavita-auto-bath-lift/"
//     ]
//   },
//   {
//     category: 'http://www.1800wheelchair.com/category/752/bath-lifts/',
//     products: [
//       "http://www.1800wheelchair.com/product/bellavita-auto-bath-lift/",
//       "http://www.1800wheelchair.com/product/splash-bath-lift/",
//       "http://www.1800wheelchair.com/product/drive-aquajoy-premier-plus-reclining-bathlift/",
//       "http://www.1800wheelchair.com/product/drive-bellavita-hand-control-including-storage-battery/",
//       "http://www.1800wheelchair.com/product/side-flap-for-drive-bellavita-auto-bath-lift/"
//     ]
//   },
//   {
//     category: 'http://www.1800wheelchair.com/category/752/bath-lifts/',
//     products: [
//       "http://www.1800wheelchair.com/product/bellavita-auto-bath-lift/",
//       "http://www.1800wheelchair.com/product/splash-bath-lift/",
//       "http://www.1800wheelchair.com/product/drive-aquajoy-premier-plus-reclining-bathlift/",
//       "http://www.1800wheelchair.com/product/drive-bellavita-hand-control-including-storage-battery/",
//       "http://www.1800wheelchair.com/product/side-flap-for-drive-bellavita-auto-bath-lift/"
//     ]
//   }
// ]

// var fs = require('fs')
// var write = function (links, fileName) {
//   fs.writeFile('files/' + 'testObj.txt', JSON.stringify(testObject), function (err) {
//     if (err) {
//       debugger;
//       var e = err;
//     }
//   });
// }

// var read = function (links, fileName) {
//   var obj;
//   fs.readFile('files/' + 'testObj.txt', 'utf8', function (err, data) {
//     if (err) throw err;
//     obj = JSON.parse(data);
//     debugger;
//   });
// }
//write()
//read()
var csvReader = require('./csvReader')
csvReader.readProductsUrls('readed')

var gp = require('./globalProperties')
var csvWriter = require('./csvWriter')
gp._emitter.on('readed', function () {
  let pc = 0;
  for (let i = 0; i < gp._ProductsUrlObject.length; i++) {
    //console.log(gp._ProductsUrlObject[i].caregory + " - " + (i + 1))
    for (let j = 0; j < gp._ProductsUrlObject[i].products.length; j++) {
      console.log(csvWriter.urlKeyGet(gp._ProductsUrlObject[i].products[j]));
    }
  }
})