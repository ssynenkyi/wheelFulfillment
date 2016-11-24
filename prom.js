//var appjs = require("./app");
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var http = require('http');
//var excelWriter = require("./excelWriter.js");
var pdfUtils = require("./pdfUtils");
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var fileExists = require('file-exists');
var EventEmitter = require('events').EventEmitter;
//var Promise = require('Promise');
var _emitter = new EventEmitter();
var _Products = [];
var _ProductsCount = 0;
var _parsedImagesCount = 0;
var _ProductImagesCount = [];
var _ProductListUrl = "http://www.1800wheelchair.com/";
var _lastPageReached = false;
var _ProductUrls = [];
var _ProductCategoriesUrls = []
var _lastImageParsedEmited = false;
var _readyToBeEmit = false;
var _insideLinks = 0;
let as1 = function () {
    return new Promise(function (resolve, reject) {
        //appjs.FillProductLinks("http://www.1800wheelchair.com/category/standard-wheelchairs/", true)  
        var currentLink = "http://www.1800wheelchair.com/category/standard-wheelchairs/";
        request(currentLink, function (error, response, html) {
            _insideLinks++;
            console.log('fpl inside :' + _insideLinks);
            if (!error) {
                var $ = cheerio.load(html);
                $('#products-list').filter(function () {
                    var data = $(this);
                    var productsUrls = data.find('.product-name a');
                    for (var i = 0; i < productsUrls.length; i++) {
                        console.log($(productsUrls[i]).attr('href'));
                    }
                });
            }
            resolve('Cleaned The Room');
        });
    });
}

// let as2 = function (currentLink) {   
//     return new Promise(function (resolve, reject) {
//         //appjs.FillProductLinks("http://www.1800wheelchair.com/category/standard-wheelchairs/", true)
//         request(currentLink, function (error, response, html) {
//             _insideLinks++;
//             console.log('fpl inside :' + _insideLinks);
//             if (!error) {
//                 var $ = cheerio.load(html);
//                 $('#products-list').filter(function () {
//                     var data = $(this);
//                     var productsUrls = data.find('.product-name a');
//                     for (var i = 0; i < productsUrls.length; i++) {
//                         console.log($(productsUrls[i]).attr('href'));
//                     }
//                 });
//             }
//             resolve('Cleaned The Room');
//         });
//     });
// }

// let removeGarbage = function (message) {
//     return new Promise(function (resolve, reject) {
//         resolve(message + ' remove Garbage');
//     });
// };

// let winIcecream = function (message) {
//     return new Promise(function (resolve, reject) {
//         resolve(message + ' won Icecream');
//     });
// };

var urls = [
    'http://www.1800wheelchair.com/category/601/golden-technologies-lift-chairs/',
    'http://www.1800wheelchair.com/category/2-wheel-walkers/',
    'http://www.1800wheelchair.com/category/lifting-cushions/',
    'http://www.1800wheelchair.com/category/crutch-accessories/',
    'http://www.1800wheelchair.com/category/423/shower-seats-bath-benches/',
    'http://www.1800wheelchair.com/category/standard-wheelchairs/',
    'http://www.1800wheelchair.com/category/3-wheel-scooters/',
    'http://www.1800wheelchair.com/category/bed-pads-chucks/',
    'http://www.1800wheelchair.com/category/power-chair-accessories/',
    'http://www.1800wheelchair.com/category/heavy-duty-wheelchairs/',
    'http://www.1800wheelchair.com/category/4-wheel-rollators/',
    'http://www.1800wheelchair.com/category/752/bath-lifts/',
    'http://www.1800wheelchair.com/category/heavy-inco/',
    'http://www.1800wheelchair.com/category/heavy-duty-lift-chairs/',
    'http://www.1800wheelchair.com/category/portable-mobility-scooters/',
    'http://www.1800wheelchair.com/category/outdoor-mobility-scooters/'];

var _insideLinks = 0;
var fillProductLinks = function (currentLink) {
    return new Promise(function (resolve, reject) {
        request(currentLink, function (error, response, html) {
            _insideLinks++;
            console.log('fpl inside :' + _insideLinks);
            console.log(currentLink);
            resolve(currentLink);
        });
    });
}
var pr1 = [];
var promises2 = [];
var chunkVolume = 8;

var links = function () {
    for (var i = 0; i < chunkVolume; i++) {
        if (urls.length <= i) {
            break;
        } else if (urls[i] != 'http://www.1800wheelchair.com/category/296/wheelchair-accessories/') {
            pr1.push(fillProductLinks(urls[i] /*, true*/));
        }
    }   
    debugger;
    Promise.all(pr1).then(values =>{
        pr1 = [];
        for (var i = chunkVolume; i < chunkVolume * 2; i++) {
        if (urls.length <= i) {
            break;
        } else if (urls[i] != 'http://www.1800wheelchair.com/category/296/wheelchair-accessories/') {
            pr1.push(fillProductLinks(urls[i] /*, true*/));
        }
        Promise.all(pr1).then(() => {
            debugger;
        })
    }
    });
}
links();
//var requestAsync = promisify(request);
// var urls = ['http://www.1800wheelchair.com/category/standard-wheelchairs/',
//     'http://www.1800wheelchair.com/category/travel-chairs/'];

// Promise.all([requestAsync('url1'), requestAsync('url2')])
//     .then(function(allData) {
//         // All data available here in the order it was called.
//     });
// Promise.all(urls.map(as2)).then(allData => {
//     debugger;
//     console.log(allData);
//     // All data available here in the order of the elements in the array
// });

// cleanRoom().then(function (result) {
//     return removeGarbage(result);
// }).then(function (result) {
//     return winIcecream(result);
// }).then(function (result) {
//     console.log('finished ' + result);
// })