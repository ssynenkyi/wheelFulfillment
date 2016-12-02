var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var linkHandler = require('./productListHandler');
var Product = require('./Product.js').Product
var gp = require('./globalProperties')
var productParser = require('./productParser')
const iu = require('./imageUtils');
const csvReader = require('./csvReader');
const fs = require('fs');
const jsonHandler = require('./jsonHandler');

var readProductsLinks = function (eventName) {
    csvReader.readProductsUrls('parseProduct');
}

var _parsedCategory = 0;
gp._emitter.on('parseProduct', function () {
    if (_parsedCategory < gp._ProductsUrlObject.length && _parsedCategory <= 2 ) {
        for (let i = 0; i < gp._ProductsUrlObject[_parsedCategory].products.length; i++) {
            let volume = gp._ProductsUrlObject[_parsedCategory].products.length;
            let productLink = gp._ProductsUrlObject[_parsedCategory].products[i];
            productParser.parseProduct(productLink, volume, 'parseProduct');
        }
        _parsedCategory++;
    } else {
        gp._emitter.emit('writeCsv')
    }   
});

gp._emitter.on('writeCsv', function(){
    jsonHandler.write('./files/imageObjects.txt', gp._ListOfImageUrls, 'Image objects were successfully saved.');
    //csvWriter.writeCsv(gp._Products, 'result')
});

var parse = function (productUrl, volume, nextEventName) {
    productParser.parseProduct(productUrl);
}

readProductsLinks();

// gp._emitter.on('subCategoriesParse', function () {
//     if (gp._SubCategoriesUrls.length > 0)
//         subcategoriesParse('subCategoriesParse');
//     else {
//         gp._ListOfProductLinks.sort();
//         console.log('links count' + gp._ListOfProductLinks.length);
//         console.log('gp._ListOfProductLinks');
//         csvWriter.writeLinksToCsv(gp._ListOfProductLinks, gp._ListFileName);
//         // console.log('links count' + gp._ListOfProductLinks.length); 
//         // console.log()
//         //gp._emitter.emit('parseProduct');
//     }
// });

// var subcategoriesParse = function (eventName) {
//     //debugger;
//     if (gp._SubCategoriesUrls.length === 0) {
//         gp._emitter.emit(eventName);
//     } else {
//         let subCategories = gp._SubCategoriesUrls;
//         gp._SubCategoriesUrls = [];
//         for (var i = 0; i < subCategories.length; i++) {
//             linkHandler.handleLinks(subCategories[i], subCategories.length, eventName)
//         }
//     }
// }

// // gp._emitter.on('theLastPageLinksParsed', function () {
// //     for (var i = 0; i < gp._ProductUrls.length; i++) {
// //         productParser.parseProduct(gp._ProductUrls[i]);
// //     }
// // })


// gp._emitter.on('theLastImageParsed', function () {
//     csvWriter.writeCsv(gp._Products, 'result');
// });

// // Part for downloading all images for current product

// let countOfAllImages = 0;

// gp._emitter.on('theImagesOfProductsWereDownloaded', result => {
//     gp._Products = gp._Products.map(product => {
//         product.images = product.savedImages;
//         delete product.savedImages;
//         return product;
//     });
//     console.log('All images were downloaded successfully.');
// });

// gp._emitter.on('theImageWasDownloaded', result => {
//     const product = getProductById(result.productId);

//     product.savedImages.push(result.path);

//     if (result.countOfDownloadedImages == countOfAllImages) {
//         console.log(`Have to download: ${countOfAllImages} Downloaded: ${result.countOfDownloadedImages}`);
//         gp._emitter.emit('theImagesOfProductsWereDownloaded');
//     } else {
//         console.log(`It was downloaded ${result.countOfDownloadedImages} images`);
//     }
// });

// gp._emitter.on('theLastProductParsed', () => {

//     countOfAllImages = gp._Products.reduce((total, product) => {
//         return total + product.images.length;
//     }, 0);

//     console.log(`Count of Images to be downloaded: ${countOfAllImages}`);

//     for (var i = 0; i < gp._Products.length; i++) {
//         iu.downloadImagesForProduct(gp._Products[i]);
//     }
// });

// function getProductById(id) {
//     return gp._Products.filter(product => {
//         return product.productId === id;
//     })[0];
// }

// // end of Part

// // const _ProductListUrl = "http://www.1800wheelchair.com/category/all-categories/";
// // linkHandler.fillProductCategoriesLinks(_ProductListUrl, 'categoriesParse');

// // var linksArray = 
// // [
// //     "http://www.1800wheelchair.com/product/excel-k3-lightweight-wheelchair/",
// //     "http://www.1800wheelchair.com/product/karman-ergo-flight-wheelchair/", 
// //     "http://www.1800wheelchair.com/product/cruiser-iii-35-lbs-wheelchair/",
// //     "http://www.1800wheelchair.com/product/excel-extra-wide-manual-wheelchair/",
// //     "http://www.1800wheelchair.com/product/karman-s-115-ergonomic-wheelchair/",
// //     "http://www.1800wheelchair.com/product/medline-k3-plus-light-basic-wheelchair/",
// //     "http://www.1800wheelchair.com/product/drive-cruiser-x4-wheelchair/",
// //     "http://www.1800wheelchair.com/product/blue-streak-wheelchair-w-flip-back-arms/",
// //     "http://www.1800wheelchair.com/product/invacare-tracer-ex2-36-lbs-wheelchair/",
// //     "http://www.1800wheelchair.com/product/drive-silver-sport-2-dual-axle-wheelchair/"
// // ];
// // csvWriter.writeLinksToCsv(linksArray, 'files/test.csv');

// csvReader.ReadLinksFromCsv('files/ProductsList1.csv')

