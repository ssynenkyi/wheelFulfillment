var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
//var http = require('http');
//var pdfUtils = require("./pdfUtils");
var csvWriter = require("./csvWriter.js");// add 2 to delete images
var linkHandler = require('./productListHandler');
var Product = require('./Product.js').Product
var gp = require('./globalProperties')
var productParser = require('./productParser')
const iu = require('./imageUtils');


gp._emitter.on('parseProduct', function () {
    if (gp._ProductListCount < gp._ProductUrls.length) {
        productParser.parseProduct(gp._ProductUrls[gp._ProductListCount]);
    }
    gp._ProductListCount++;
})

var _chunkVolume = 75;

// //second part of categories 
// gp._emitter.on('firstChunkParsed', function () {
//     let restOfCategoriesCount = gp._ProductCategoriesUrls.length - _chunkLinksCount;
//     for (var i = _chunkLinksCount; i < gp._ProductCategoriesUrls.length; i++) {
//         linkHandler.handleLinks(gp._ProductCategoriesUrls[i], restOfCategoriesCount, 'secondChunkParsed');
//     }
// });

// //first part of categories
// gp._emitter.on('FirstPageCategoryParsed', function () {
//     //first 75 lists of products parse
//     for (var i = 0; i < _chunkLinksCount; i++) {
//         linkHandler.handleLinks(gp._ProductCategoriesUrls[i], _chunkLinksCount, 'firstChunkParsed');
//     }
// });
var _startUrl = 0;
var _endUrl = _chunkVolume;

gp._emitter.on('categoriesParse', function () {
    let toCount = _endUrl < (gp._ProductCategoriesUrls.length - 1) ? _endUrl : (gp._ProductCategoriesUrls.length - 1);
    //recurtion to the last chunk
    let nextEventName = 'categoriesParse';
    if (_endUrl < (gp._ProductCategoriesUrls.length - 1))
        toCount = _endUrl;
    else {
        toCount = (gp._ProductCategoriesUrls.length - 1)
        //if the last portion of categories
        nextEventName = 'subCategoriesParse'
    }
    let volume = toCount - _startUrl;
    for (let i = _startUrl; i < toCount; i++) {
        linkHandler.handleLinks(gp._ProductCategoriesUrls[i], volume, nextEventName);
    }
    _startUrl += _chunkVolume;
    _endUrl += _chunkVolume;
});

gp._emitter.on('subCategoriesParse', function () {
    if (gp._SubCategoriesUrls.length > 0)
        subcategoriesParse('subCategoriesParse');
    else
        gp._emitter.emit('parseProduct');
});

var subcategoriesParse = function (eventName) {
    if (gp._SubCategoriesUrls.length === 0) {
        gp._emitter.emit(eventName);
    } else {
        let subCategories = gp._SubCategoriesUrls;
        gp._SubCategoriesUrls = [];
        for (var i = 0; i < subCategories.length; i++) {
            linkHandler.handleLinks(subCategories[i], subCategories.length, eventName)
        }
    }
}

// gp._emitter.on('theLastPageLinksParsed', function () {
//     for (var i = 0; i < gp._ProductUrls.length; i++) {
//         productParser.parseProduct(gp._ProductUrls[i]);
//     }
// })


gp._emitter.on('theLastImageParsed', function () {
    csvWriter.writeCsv(gp._Products, 'result');
});

// Part for downloading all images for current product

let countOfAllImages = 0;

gp._emitter.on('theImagesOfProductsWereDownloaded', result => {
    gp._Products = gp._Products.map(product => {
        product.images = product.savedImages;
        delete product.savedImages;
        return product;
    });
    console.log('All images were downloaded successfully.');
});

gp._emitter.on('theImageWasDownloaded', result => {
    const product = getProductById(result.productId);

    product.savedImages.push(result.path);

    if (result.countOfDownloadedImages == countOfAllImages) {
        console.log(`Have to download: ${countOfAllImages} Downloaded: ${result.countOfDownloadedImages}`);
        gp._emitter.emit('theImagesOfProductsWereDownloaded');
    } else {
        console.log(`It was downloaded ${result.countOfDownloadedImages} images`);
    }
});

gp._emitter.on('theLastProductParsed', () => {

    countOfAllImages = gp._Products.reduce((total, product) => {
        return total + product.images.length;
    }, 0);

    console.log(`Count of Images to be downloaded: ${countOfAllImages}`);

    for (var i = 0; i < gp._Products.length; i++) {
        iu.downloadImagesForProduct(gp._Products[i]);
    }
});

function getProductById(id) {
    return gp._Products.filter(product => {
        return product.productId === id;
    })[0];
}

// end of Part

const _ProductListUrl = "http://www.1800wheelchair.com/category/all-categories/";
linkHandler.fillProductCategoriesLinks(_ProductListUrl, 'categoriesParse');


// var pdfsWithSpacesReplace = function (html, pdfLinks) {
//     if (pdfLinks.length > 0) {
//         for (var i = 0; i < pdfLinks.length; i++) {
//             if (pdfLinks[i].indexOf('/pdfs/') < 0) {
//                 var newLink = '/pdfs/' + pdfLinks[i].substring(6, pdfLinks[i].trim().length);
//                 html = html.replace(pdfLinks[i], newLink);
//                 pdfLinks[i] = newLink;
//             }
//             if (pdfLinks[i].indexOf('%20') >= 0) {
//                 var newLink = pdfLinks[i].replace(new RegExp('%20', 'g'), '_');
//                 html = html.replace(pdfLinks[i], newLink);
//             }
//         }
//     }
//     return html;
// }
// var descriptionGet = function (data) {
//     var pdfList = pdfsDownload(data, 'Desc');
//     var desc = data.find('span[id$="_lblDescription"]');
//     if (desc != undefined && desc.length > 0) {
//         var result = pdfsWithSpacesReplace(desc.html(), pdfList);
//         return result;
//     }
//     return '';
// }

// var pdfsDownload = function (data, containerId) {
//     var pdfList = []
//     var anchers = data.find('#' + containerId + ' a');
//     if (anchers.length > 0) {
//         for (var i = 0; i < anchers.length; i++) {
//             if (anchers[i].attribs != undefined &&
//                 anchers[i].attribs.href != undefined &&
//                 anchers[i].attribs.href.toLowerCase().indexOf(/pdfs/) == 0) {
//                 pdfUtils.downloadFile(anchers[i].attribs.href);
//                 pdfList.push(anchers[i].attribs.href);
//             }
//         }
//     }
//     return pdfList;
// }



// var isFloat = function (n) {
//     if (n == '')
//         return false;
//     n = n.replace('$', '').trim();
//     return Number(n) == n;
// }

