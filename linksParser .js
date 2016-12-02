// var express = require('express');
// var request = require('request');
// var cheerio = require('cheerio');
// var app = express();
// var csvWriter = require("./csvWriter.js");// add 2 to delete images
// var linkHandler = require('./productListHandler');
// var Product = require('./Product.js').Product
// var gp = require('./globalProperties')
// var productParser = require('./productParser')
// const iu = require('./imageUtils');


// function UrlsParse(fileName){

// }


// gp._emitter.on('parseProduct', function () {
//     if (gp._ProductListCount < gp._ProductUrls.length) {
//         productParser.parseProduct(gp._ProductUrls[gp._ProductListCount]);
//     }
//     gp._ProductListCount++;
// })

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

// const _ProductListUrl = "http://www.1800wheelchair.com/category/all-categories/";
// linkHandler.fillProductCategoriesLinks(_ProductListUrl, 'categoriesParse');
