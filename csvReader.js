const fs = require('fs')
const csv = require('fast-csv')
const gp = require('./globalProperties')

exports.ReadLinksFromCsv = function (fileName, eventName) {
    fs.createReadStream(fileName)
        .pipe(csv())
        .on('data', function (data) {
            gp._ListOfProductLinks = data;
            gp._ListOfProductLinks.sort();
            //  debugger;
            //  console.log(gp._ListOfProductLinks);
        })
        .on('end', function (data) {
            gp._emitter.emit(eventName);
        })
}


exports.readProductsUrls = function (eventName) {
    var obj;
    fs.readFile('files/urlObjects.txt', 'utf8', function (err, data) {
        if (err) throw err;
        gp._ProductsUrlObject = JSON.parse(data);
        gp._emitter.emit(eventName);
        // let pc = 0;
        // for (let i = 0; i < gp._ProductsUrlObject.length; i++) {
        //     console.log(gp._ProductsUrlObject[i].caregory + " - " + (i+ 1))
        //     for (let j = 0; j < gp._ProductsUrlObject[i].products.length; j++) {
        //         console.log((++ pc) + ' - ' +  gp._ProductsUrlObject[i].products[j])
        //     }
        // }
    });
}