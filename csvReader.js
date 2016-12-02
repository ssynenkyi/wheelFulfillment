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
};

exports.readProductsUrls = function (filename, done) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            done(err);
        } else {
            let productUrlObj = JSON.parse(data);
            done(null, productUrlObj);
        }
    });
};